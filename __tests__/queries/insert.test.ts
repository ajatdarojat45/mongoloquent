import Model from "../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "../../src/interfaces/ISchema";

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

// Clear the users collection before all tests
beforeAll(async () => {
  try {
    await userCollection?.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

// Clear the users collection after all tests
afterAll(async () => {
  try {
    await userCollection?.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - insert method", () => {
  // Clear the users collection after each test in this describe block
  afterAll(async () => {
    try {
      await userCollection?.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should insert data without timestamps and soft delete", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const result = await User.insert({
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

  it("should insert data with timestamps but without soft delete", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = true;

    const result = await User.insert({
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

  it("should insert data with soft delete but without timestamps", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    const result = await User.insert({
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

  it("should insert data with both soft delete and timestamps", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = true;

    const result = await User.insert({
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
