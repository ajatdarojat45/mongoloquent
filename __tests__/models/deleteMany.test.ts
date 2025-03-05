import Model from "../../src/Model";

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

describe("User Model - deleteMany method", () => {
  const userCollection = User["getCollection"]();

  // Clear the collection before each test
  beforeEach(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  // Clear the collection after all tests in this describe block
  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should delete multiple documents when conditions match", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.where("age", "<", 30).deleteMany();
    const users = await User.all();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 2);
    expect(users).toEqual([]);
  });

  it("should soft delete multiple documents when conditions match", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.where("age", "<", 30).deleteMany();
    const users = await User.where("age", "<", 30).withTrashed().get();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 2);
    expect(users).toHaveLength(2);
  });

  it("should return zero deleted count when no documents match the conditions", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const result = await User.where("age", ">", 30).deleteMany();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 0);
  });
});
