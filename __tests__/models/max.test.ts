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

// Clear the collection before all tests
beforeAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

// Clear the collection after all tests
afterAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - max method", () => {
  const userCollection = User["getCollection"]();

  // Insert test data before each test
  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  // Clear test data after each test
  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return the maximum age value without soft delete", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.max("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(50);
  });

  it("should return the maximum age value with soft delete enabled", async () => {
    User["$useSoftDelete"] = true;

    const result = await User.max("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(20);
  });

  it("should return the maximum age value for a specific user", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Udin").max("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("should return 0 when no matching data is found", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Udin1").max("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });

  it("should return 0 when the field is not a number", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.max("name");
    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});
