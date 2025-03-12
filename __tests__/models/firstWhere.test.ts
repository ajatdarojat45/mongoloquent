import Model from "../../src/Model";

class User extends Model {
  static $collection = "users";
}

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    [User["$isDeleted"]]: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    [User["$isDeleted"]]: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    [User["$isDeleted"]]: true,
    age: 50,
  },
];

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

describe("User Model - first method", () => {
  // Insert test data before each test
  beforeAll(async () => {
    try {
      const userCollection = User["getCollection"]();
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  // Clear test data after each test
  afterAll(async () => {
    try {
      const userCollection = User["getCollection"]();
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return the first user matching the query", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.firstWhere("name", "Udin");

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Udin");
  });
});
