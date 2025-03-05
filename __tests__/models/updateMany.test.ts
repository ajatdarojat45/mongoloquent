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

describe("Model - updateMany method", () => {
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

  it("should update multiple documents matching the criteria", async () => {
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

    const result = await User.where("age", "<", 30).updateMany({
      age: 50,
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 2);
  });

  it("should update only non-deleted documents when soft delete is enabled", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    await userCollection["insertMany"]([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
        IS_DELETED: false,
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
        IS_DELETED: false,
      },
      {
        name: "Kosasih",
        age: 27,
        address: "Jakarta",
        IS_DELETED: true,
      },
    ]);

    const result = await User.where("age", "<", 30).updateMany({
      age: 50,
    });
    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 2);
  });

  it("should update documents even if _id is included in the payload", async () => {
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
        age: 35,
        address: "Bandung",
      },
    ]);

    const result = await User.where("age", "<", 30).updateMany({
      _id: "5f0b0e7b8b0d3d0f3c3e3c3e",
      age: 50,
    });
    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 1);
  });

  it("should update documents even if createdAt is included in the payload", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "Kosasih",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.where("age", "<", 30).updateMany({
      createdAt: new Date(),
      age: 50,
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 2);
  });

  it("should return modifiedCount 0 if no documents match the criteria", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const result = await User.where("age", ">", 30).updateMany({
      age: 50,
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 0);
  });
});
