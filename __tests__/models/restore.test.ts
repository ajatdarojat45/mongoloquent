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

describe("User Model - restore method", () => {
  const userCollection = User["getCollection"]();

  // Clear the collection before each test
  beforeEach(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  // Clear the collection after each test
  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should restore all soft-deleted users", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    await userCollection["insertMany"]([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
        IS_DELETED: true,
      },
      {
        name: "Kosasih",
        age: 20,
        address: "Bogor",
        IS_DELETED: true,
      },
    ]);

    const result = await User.restore();
    const users = await User.get();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 2);
    expect(users).toHaveLength(2);
  });

  it("should restore specific soft-deleted user based on query", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    await userCollection["insertMany"]([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
        IS_DELETED: true,
      },
      {
        name: "Kosasih",
        age: 20,
        address: "Bogor",
        IS_DELETED: true,
      },
    ]);

    const result = await User.where("name", "Udin").restore();
    const user = await User.where("name", "Udin").first();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 1);
    expect(user).toEqual(expect.any(Object));
  });

  it("should return modifiedCount 0 if no matching soft-deleted user found", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    const result = await User.where("name", "Udin").restore();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 0);
  });
});
