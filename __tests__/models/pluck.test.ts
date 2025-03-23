import Model from "../../src/Model";

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    [Model["$isDeleted"]]: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    [Model["$isDeleted"]]: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    [Model["$isDeleted"]]: true,
    age: 50,
  },
];

class User extends Model {
  static $collection = "users";
}

beforeAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

afterAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("Model - pluck method", () => {
  const userCollection = User["getCollection"]();

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
