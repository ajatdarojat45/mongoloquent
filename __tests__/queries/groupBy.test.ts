import Model from "../../src/Model";

class User extends Model {
  static $collection = "users";
}

const userCollection = User["getCollection"]();

beforeAll(async () => {
  await userCollection.deleteMany({});

  await userCollection.insertMany([
    {
      name: "John",
      email: "john@mail.com",
      age: 10,
      balance: 100,
      IS_DELETED: false,
    },
    {
      name: "doe",
      email: "doe@mail.com",
      age: 30,
      balance: 200,
      IS_DELETED: false,
    },
    {
      name: "Udin",
      email: "udin@mail.com",
      age: 5,
      balance: 500,
      IS_DELETED: false,
    },
    {
      name: "Kosasih",
      email: "kosasih@mail.com",
      age: 5,
      balance: 400,
      IS_DELETED: false,
    },
    {
      name: "Joko",
      email: "joko@mail.com",
      age: 45,
      balance: 500,
      IS_DELETED: true,
    },
  ]);
});

afterAll(async () => {
  await userCollection.deleteMany({});
});

describe("QueryResult - groupBy method", () => {
  it("with single groupBy", async () => {
    const result: any[] = await User.groupBy("age").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("with multiple groupBy", async () => {
    const result: any[] = await User.groupBy("age").groupBy("name").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
  });
});
