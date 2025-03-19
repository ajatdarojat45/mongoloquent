import Model from "../../src/Model";

class User extends Model {
  static $collection = "users";
}

// Clear the users collection before all tests
beforeAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

// Clear the users collection after all tests
afterAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - save method", () => {
  const userCollection = User["getCollection"]();

  // Clear the users collection after each test in this describe block
  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should save data without timestamps and soft delete", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const result = await User.save({
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

  it("should save data with timestamps but without soft delete", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = true;

    const result = await User.save({
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

  it("should save data with soft delete but without timestamps", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    const result = await User.save({
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

  it("should save data with both soft delete and timestamps", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = true;

    const result = await User.save({
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
