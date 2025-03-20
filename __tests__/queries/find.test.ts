import Model from "../../src/Model";

class User extends Model {
  static $collection = "users";
}

const userCollection = User["getCollection"]();
let userIds: any = [];

beforeAll(async () => {
  await userCollection.deleteMany({});

  const { insertedIds } = await userCollection.insertMany([
    {
      name: "John",
      email: "john@mail.com",
      age: 10,
      balance: 100,
      [User.getIsDeleted()]: false,
    },
    {
      name: "doe",
      email: "doe@mail.com",
      age: 30,
      balance: 200,
      [User.getIsDeleted()]: false,
    },
    {
      name: "Udin",
      email: "udin@mail.com",
      age: 5,
      balance: 500,
      [User.getIsDeleted()]: false,
    },
    {
      name: "Kosasih",
      email: "kosasih@mail.com",
      age: 5,
      balance: 400,
      [User.getIsDeleted()]: false,
    },
    {
      name: "Joko",
      email: "joko@mail.com",
      age: 45,
      balance: 500,
      [User.getIsDeleted()]: true,
    },
  ]);
  userIds = insertedIds;
});

afterAll(async () => {
  await userCollection.deleteMany({});
});

describe("Find Method Tests", () => {
  it("should find and return a single document using first() method", async () => {
    const user = await User.find(userIds["0"]);
    const result = await user.first();
    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "John");
    expect(result).toHaveProperty("email", "john@mail.com");
    expect(result).toHaveProperty("age", 10);
    expect(result).toHaveProperty("balance", 100);
  });

  it("should find and return an array with one document using get() method", async () => {
    const user = await User.find(userIds["0"]);
    const result: any = await user.get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("name", "John");
    expect(result[0]).toHaveProperty("email", "john@mail.com");
    expect(result[0]).toHaveProperty("age", 10);
    expect(result[0]).toHaveProperty("balance", 100);
  });

  it("should return null when finding soft deleted document using first() method", async () => {
    User["$useSoftDelete"] = true;
    const user = await User.find(userIds["4"]);
    const result = await user.first();
    expect(result).toEqual(null);
    User["$useSoftDelete"] = false;
  });

  it("should return empty array when finding soft deleted document using get() method", async () => {
    User["$useSoftDelete"] = true;
    const user = await User.find(userIds["4"]);
    const result: any = await user.get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
    User["$useSoftDelete"] = false;
  });
});
