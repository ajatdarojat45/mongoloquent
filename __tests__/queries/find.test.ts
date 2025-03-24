import Model from "../../src/Model";

class User extends Model {}

const builder = User["build"]();
const userCollection = builder["getCollection"]();
let userIds: any = [];

beforeAll(async () => {
  await userCollection?.deleteMany({});

  const insertedUsers = await userCollection?.insertMany([
    {
      name: "John",
      email: "john@mail.com",
      age: 10,
      balance: 100,
      [builder.getIsDeleted()]: false,
    },
    {
      name: "doe",
      email: "doe@mail.com",
      age: 30,
      balance: 200,
      [builder.getIsDeleted()]: false,
    },
    {
      name: "Udin",
      email: "udin@mail.com",
      age: 5,
      balance: 500,
      [builder.getIsDeleted()]: false,
    },
    {
      name: "Kosasih",
      email: "kosasih@mail.com",
      age: 5,
      balance: 400,
      [builder.getIsDeleted()]: false,
    },
    {
      name: "Joko",
      email: "joko@mail.com",
      age: 45,
      balance: 500,
      [builder.getIsDeleted()]: true,
    },
  ]);
  userIds = insertedUsers?.insertedIds;
});

afterAll(async () => {
  await userCollection?.deleteMany({});
});

describe("Find Method Tests", () => {
  it("should find and return a single document using first() method", async () => {
    const result = await User?.find(userIds["0"]);
    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "John");
    expect(result).toHaveProperty("email", "john@mail.com");
    expect(result).toHaveProperty("age", 10);
    expect(result).toHaveProperty("balance", 100);
  });

  it("should find and return an array with one document using get() method", async () => {
    const result = await User.find(userIds["0"]);
    expect(result).toHaveProperty("name", "John");
    expect(result).toHaveProperty("email", "john@mail.com");
    expect(result).toHaveProperty("age", 10);
    expect(result).toHaveProperty("balance", 100);
  });

  it("should return null when finding soft deleted document using first() method", async () => {
    User["$useSoftDelete"] = true;
    const user = (await User.find(userIds["4"])) as any;
    expect(user?.["_id"]).toBeUndefined();
    User["$useSoftDelete"] = false;
  });
});
