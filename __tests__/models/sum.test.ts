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

describe("User Model - sum method", () => {
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

  it("should return the sum of ages without soft delete", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.sum("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(80);
  });

  it("should return the sum of ages with soft delete enabled", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.sum("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(30);
  });

  it("should return the sum of ages with a where condition", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Udin").sum("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("should return 0 when no matching data is found", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Udin1").sum("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });

  it("should return 0 when summing a non-numeric field", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.sum("name");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});
