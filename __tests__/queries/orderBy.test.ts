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
});

afterAll(async () => {
  await userCollection.deleteMany({});
});

describe("Model - orderBy() Method: Sorting and Ordering Results", () => {
  it("should sort documents by single field in implicit ascending order", async () => {
    const result: any[] = await User.orderBy("age").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(5);
  });

  it("should sort documents by single field in explicit ascending order", async () => {
    const result: any[] = await User.orderBy("age", "asc").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(5);
  });

  it("should sort documents by single field in descending order", async () => {
    const result: any[] = await User.orderBy("age", "desc").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(45);
  });

  it("should sort documents by string field with case-sensitive comparison", async () => {
    const result: any[] = await User.orderBy("name").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].name).not.toBe("Doe");
  });

  it("should order results by string field in case-insensitive ascending order", async () => {
    const result: any[] = await User.orderBy("name", "asc", true).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].name).toBe("doe");
  });

  it("should order results by string field in case-insensitive descending order", async () => {
    const result: any[] = await User.orderBy("name", "desc", true).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].name).toBe("Udin");
  });

  it("should order results by multiple fields with specified directions", async () => {
    const result: any[] = await User.orderBy("age", "asc")
      .orderBy("balance", "desc")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(5);
    expect(result[0].balance).toBe(500);
  });
});
