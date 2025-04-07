import { ObjectId } from "mongodb";

import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IUser extends IMongoloquentSchema {
  name: string;
  age: number;
  address: string;
}
class User extends Model<IUser> {}

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

    const result = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Jakarta",
      },
      {
        name: "Kosasih",
        age: 30,
        address: "Jakarta",
      },
    ]);

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(expect.any(ObjectId));
  });

  it("should insert data with timestamps but without soft delete", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = true;

    const result = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Jakarta",
      },
      {
        name: "Kosasih",
        age: 30,
        address: "Jakarta",
      },
    ]);

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
    expect(result?.[0]).toEqual(expect.any(ObjectId));

    const user = await User.where("_id", result[0]).first();
    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("name", "Udin");
    expect(user).toHaveProperty("age", 20);
    expect(user).toHaveProperty("address", "Jakarta");
    expect(user).toHaveProperty(query["$createdAt"]);
    expect(user).toHaveProperty(query["$updatedAt"]);
  });

  it("should insert data with soft delete but without timestamps", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    const result = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Jakarta",
      },
      {
        name: "Kosasih",
        age: 30,
        address: "Jakarta",
      },
    ]);
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(expect.any(ObjectId));

    const user = await User.where("_id", result[0]).first();
    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("name", "Udin");
    expect(user).toHaveProperty("age", 20);
    expect(user).toHaveProperty("address", "Jakarta");
    expect(user).toHaveProperty(query.getIsDeleted(), false);
  });

  it("should insert data with both soft delete and timestamps", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = true;

    const result = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Jakarta",
      },
      {
        name: "Kosasih",
        age: 30,
        address: "Jakarta",
      },
    ]);
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(expect.any(ObjectId));

    const user = await User.where("_id", result[0]).first();
    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("name", "Udin");
    expect(user).toHaveProperty("age", 20);
    expect(user).toHaveProperty("address", "Jakarta");
    expect(user).toHaveProperty(query.getIsDeleted(), false);
    expect(user).toHaveProperty(query["$createdAt"]);
    expect(user).toHaveProperty(query["$updatedAt"]);
  });
});
