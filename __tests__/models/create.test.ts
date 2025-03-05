import Model from "../../src/Model";

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
    console.error(error);
  }
});

// Clean up the collection after all tests
afterAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - create method", () => {
  const userCollection = User["getCollection"]();

  // Clean up the collection after each test in this describe block
  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  // Test case: should insert data without timestamps and soft delete
  it("should insert data without timestamps and soft delete", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const result = await User.create({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
  });

  // Test case: should insert data with timestamps
  it("should insert data with timestamps", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = true;

    const result = await User.create({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty(User["$createdAt"]);
    expect(result).toHaveProperty(User["$updatedAt"]);
  });

  // Test case: should insert data with soft delete enabled
  it("should insert data with soft delete enabled", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    const result = await User.create({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty(User.getIsDeleted(), false);
  });

  // Test case: should insert data with both soft delete and timestamps enabled
  it("should insert data with both soft delete and timestamps enabled", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = true;

    const result = await User.create({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty(User.getIsDeleted(), false);
    expect(result).toHaveProperty(User["$createdAt"]);
    expect(result).toHaveProperty(User["$updatedAt"]);
  });
});
