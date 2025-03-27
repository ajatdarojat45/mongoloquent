import { IMongoloquentSchema } from "../../src/interfaces/ISchema";
import Model from "../../src/Model";

interface IUser extends IMongoloquentSchema {
  name: string;
  email: string;
  age: number;
}
class User extends Model {
  static $schema: IUser;
}

const query = User["query"]();
const userCollection = query["getCollection"]();

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    [query["$isDeleted"]]: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    [query["$isDeleted"]]: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    [query["$isDeleted"]]: true,
    age: 50,
  },
];

beforeAll(async () => {
  try {
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

afterAll(async () => {
  try {
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("Model - pluck method", () => {
  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return an array of values for the specified field", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual(["John Doe", "Udin", "Kosasih"]);
  });

  it("should return an array of values for the specified field with a where condition", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Udin").pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual(["Udin"]);
  });

  it("should return an empty array when no matching data is found", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Udin1").pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual([]);
  });

  it("should return an empty array when the specified field does not exist", async () => {
    User["$useSoftDelete"] = false;
    // @ts-ignore
    const result = await User.pluck("address");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual([]);
  });

  it("should return an array of values for the specified field with $skip applied", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.skip(1).pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual(["Udin", "Kosasih"]);
  });

  it("should return an array of values for the specified field with $limit applied", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.limit(2).pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual(["John Doe", "Udin"]);
  });

  it("should return an array of values for the specified field with both $skip and $limit applied", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.skip(1).limit(1).pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual(["Udin"]);
  });
});
