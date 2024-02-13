import Model from "../../src/database/Model";

class User extends Model {
  protected collection = "users";
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
      isDeleted: false,
    },
    {
      name: "doe",
      email: "doe@mail.com",
      age: 30,
      balance: 200,
      isDeleted: false,
    },
    {
      name: "Udin",
      email: "udin@mail.com",
      age: 5,
      balance: 500,
      isDeleted: false,
    },
    {
      name: "Kosasih",
      email: "kosasih@mail.com",
      age: 5,
      balance: 400,
      isDeleted: false,
    },
    {
      name: "Joko",
      email: "joko@mail.com",
      age: 45,
      balance: 500,
      isDeleted: false,
    },
  ]);
});

afterAll(async () => {
  await userCollection.deleteMany({});
});

describe("QueryResult - orderBy method", () => {
  it("orderBy without define order", async () => {
    const result: any[] = await User.orderBy("age").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(5);
  });

  it("orderBy with asc order", async () => {
    const result: any[] = await User.orderBy("age", "asc").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(5);
  });

  it("orderBy with desc order", async () => {
    const result: any[] = await User.orderBy("age", "desc").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(45);
  });

  it("orderBy with string field", async () => {
    const result: any[] = await User.orderBy("name").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].name).not.toBe("Doe");
  });

  it("orderBy with insensitive", async () => {
    const result: any[] = await User.orderBy("name", "asc", true).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].name).toBe("doe");
  });

  it("orderBy with insensitive and desc order", async () => {
    const result: any[] = await User.orderBy("name", "desc", true).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].name).toBe("Udin");
  });

  it("orderBy with multiple orderBy", async () => {
    const result: any[] = await User.orderBy("age", "asc")
      .orderBy("balance", "desc")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(5);
    expect(result[0].balance).toBe(500);
  });
});
