import Model from "../../src/Model";

// Sample user data for testing
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

// Define User model extending from Model
class User extends Model {
  static $collection = "users";
}

// Clean up the collection before all tests
beforeAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error("Error in beforeAll:", error);
  }
});

// Clean up the collection after all tests
afterAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error("Error in afterAll:", error);
  }
});

describe("User Model - all method", () => {
  const userCollection = User["getCollection"]();

  // Insert sample data before each test in this describe block
  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error("Error in beforeAll (describe):", error);
    }
  });

  // Clean up the collection after each test in this describe block
  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error("Error in afterAll (describe):", error);
    }
  });

  // Test case: should return all users excluding soft deleted users
  it("should return all users excluding soft deleted users", async () => {
    User["$useSoftDelete"] = false;

    const result = await User.all();
    expect(result.length).toBe(3);
    expect(result).toEqual(expect.any(Array));
    expect(result[0]).toEqual(expect.any(Object));
  });

  // Test case: should return all users including soft deleted users
  it("should return all users including soft deleted users", async () => {
    User["$useSoftDelete"] = true;

    const result = await User.all();
    expect(result.length).toBe(2);
    expect(result).toEqual(expect.any(Array));
    expect(result[0]).toEqual(expect.any(Object));
  });
});
