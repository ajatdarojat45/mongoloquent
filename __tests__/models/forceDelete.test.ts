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

describe("Model - forceDelete method", () => {
  const userCollection = User["getCollection"]();

  // Clear the collection before each test
  beforeEach(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  // Clear the collection after all tests
  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should force delete all soft-deleted data", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    await userCollection["insertMany"]([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
        [Model["$isDeleted"]]: true,
      },
      {
        name: "Kosasih",
        age: 20,
        address: "Bogor",
        [Model["$isDeleted"]]: true,
      },
    ]);

    const result = await User.forceDelete();
    const users = await User.withTrashed().get();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 2);
    expect(users).toEqual([]);
  });

  it("should force delete soft-deleted data with specific query", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    await userCollection["insertMany"]([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
        [Model["$isDeleted"]]: true,
      },
      {
        name: "Kosasih",
        age: 20,
        address: "Bogor",
        [Model["$isDeleted"]]: true,
      },
    ]);

    const result = await User.where("name", "Udin").forceDelete();
    const user = await User.where("name", "Udin").withTrashed().first();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 1);
    expect(user).toEqual(null);
  });

  it("should return zero deleted count when no data matches the query", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    const result = await User.where("name", "Udin").forceDelete();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 0);
  });
});
