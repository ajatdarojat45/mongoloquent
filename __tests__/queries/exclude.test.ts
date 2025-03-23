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
      [Model["$isDeleted"]]: false,
    },
    {
      name: "doe",
      email: "doe@mail.com",
      age: 30,
      balance: 200,
      [Model["$isDeleted"]]: false,
    },
    {
      name: "Udin",
      email: "udin@mail.com",
      age: 5,
      balance: 500,
      [Model["$isDeleted"]]: false,
    },
    {
      name: "Kosasih",
      email: "kosasih@mail.com",
      age: 5,
      balance: 400,
      [Model["$isDeleted"]]: false,
    },
    {
      name: "Joko",
      email: "joko@mail.com",
      age: 45,
      balance: 500,
      [Model["$isDeleted"]]: true,
    },
  ]);
});

afterAll(async () => {
  await userCollection.deleteMany({});
});

describe("Query Builder - exclude() method", () => {
  it("should exclude a single field when passing a string parameter", async () => {
    const result = await User.exclude("name").first();

    expect(result).toEqual(expect.any(Object));
    expect(result?.name).toBeUndefined();
    expect(result?.email).toBeDefined();
    expect(result?.age).toBeDefined();
    expect(result?.balance).toBeDefined();
    expect(result?.[Model["$isDeleted"]]).toBeDefined();
  });

  it("should exclude multiple fields when passing an array parameter", async () => {
    const result = await User.exclude(["name", "age"]).first();

    expect(result).toEqual(expect.any(Object));
    expect(result?.name).toBeUndefined();
    expect(result?.email).toBeDefined();
    expect(result?.age).toBeUndefined();
    expect(result?.balance).toBeDefined();
    expect(result?.[Model["$isDeleted"]]).toBeDefined();
  });

  it("should exclude fields when chaining multiple exclude() calls", async () => {
    const result = await User.exclude("name").exclude(["age", "email"]).first();

    expect(result).toEqual(expect.any(Object));
    expect(result?.name).toBeUndefined();
    expect(result?.email).toBeUndefined();
    expect(result?.age).toBeUndefined();
    expect(result?.balance).toBeDefined();
    expect(result?.[Model["$isDeleted"]]).toBeDefined();
  });
});
