import Model from "../../src/Model";

// Sample user data for testing
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

// Define a User model extending the base Model
class User extends Model {
  static $collection = "users";
}

// Clear the user collection before all tests
beforeAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

// Clear the user collection after all tests
afterAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - count method", () => {
  const userCollection = User["getCollection"]();

  // Insert sample users before each test suite
  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  // Clear the user collection after each test suite
  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  // Test case: should return count of all users excluding soft deleted users
  it("should return count of all users excluding soft deleted users", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(3);
  });

  // Test case: should return count of all users including soft deleted users
  it("should return count of all users including soft deleted users", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(2);
  });

  // Test case: should return count of users with a specific name
  it("should return count of users named 'Udin'", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Udin").count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(1);
  });

  // Test case: should return 0 for non-existent user data
  it("should return 0 for non-existent user data", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Udin1").count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});
