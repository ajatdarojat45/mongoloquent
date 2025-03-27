import {
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "../../src/interfaces/ISchema";
import Model from "../../src/Model";

interface IUser extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  age: number;
  address: string;
}
class User extends Model {
  static $schema: IUser;
}

const query = User["query"]();
const userCollection = query["getCollection"]();

// Clean up the collection before all tests
beforeAll(async () => {
  try {
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

// Clean up the collection after all tests
afterAll(async () => {
  try {
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - create method", () => {
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
    expect(result).toHaveProperty(query["$createdAt"]);
    expect(result).toHaveProperty(query["$updatedAt"]);
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
    expect(result).toHaveProperty(query.getIsDeleted(), false);
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
    expect(result).toHaveProperty(query.getIsDeleted(), false);
    expect(result).toHaveProperty(query["$createdAt"]);
    expect(result).toHaveProperty(query["$updatedAt"]);
  });
});
