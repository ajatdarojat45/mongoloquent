import Model from "../../src/Model";

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    IS_DELETED: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    IS_DELETED: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    IS_DELETED: true,
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

describe("User Model - min method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      const _users = JSON.parse(JSON.stringify(users));
      _users[1].isDeleted = true;

      await userCollection.insertMany(_users);
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

  it("should return the minimum value of the specified field", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("should return the minimum value of the specified field considering soft delete", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.min("age");
    console.log(result);
    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("should return the minimum value of the specified field with a where condition", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Kosasih").min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(50);
  });

  it("should return 0 when no matching data is found", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Udin1").min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });

  it("should return 0 when the specified field is not a number", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.min("name");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});
