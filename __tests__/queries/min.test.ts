import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IUser extends IMongoloquentSchema {
  name: string;
  email: string;
  age: number;
}

class User extends Model<IUser> {}

class UserD extends Model<IUser> {
  protected $useSoftDelete = true;
  protected $collection: string = "users";
}

const query = User["query"]();
const userCollection = query["getCollection"]();

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    [query.getIsDeleted()]: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    [query.getIsDeleted()]: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    [query.getIsDeleted()]: true,
    age: 50,
  },
];

beforeEach(async () => {
  try {
    await userCollection.insertMany(users);
  } catch (error) {
    console.error(error);
  }
});

afterEach(async () => {
  try {
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - min method", () => {
  it("should return the minimum value of the specified field", async () => {
    const result = await User.min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("should return the minimum value of the specified field considering soft delete", async () => {
    const user = await UserD.withTrashed().get();
    const result = await UserD.min("age");
    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("should return the minimum value of the specified field with a where condition", async () => {
    const result = await User.where("name", "Kosasih").min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(50);
  });

  it("should return 0 when no matching data is found", async () => {
    const result = await User.where("name", "Udin1").min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });

  it("should return 0 when the specified field is not a number", async () => {
    const result = await User.min("name");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});
