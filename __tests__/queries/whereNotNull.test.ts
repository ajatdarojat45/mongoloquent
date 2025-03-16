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
      subscription: null,
    },
    {
      name: "doe",
      email: "doe@mail.com",
      age: 30,
      balance: 200,
      [User.getIsDeleted()]: false,
      subscription: null,
    },
    {
      name: "Udin",
      email: "udin@mail.com",
      age: 5,
      balance: 500,
      [User.getIsDeleted()]: false,
      subscription: null,
    },
    {
      name: "Kosasih",
      email: "kosasih@mail.com",
      age: 5,
      balance: 400,
      [User.getIsDeleted()]: false,
      subscription: true,
    },
    {
      name: "Joko",
      email: "joko@mail.com",
      age: 45,
      balance: 500,
      [User.getIsDeleted()]: true,
      subscription: true,
    },
  ]);
});

afterAll(async () => {
  await userCollection.deleteMany({});
});

describe("QueryResult - whereNotNull method", () => {
  it("single condition with operator", async () => {
    const result = await User.whereNotNull("subscription").get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("with and condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .whereNotNull("subscription")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("with or condition", async () => {
    const result: any[] = await User.whereNotNull("subscription")
      .orWhere("age", 5)
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("with and & or condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .where("age", 5)
      .orWhereNotNull("subscription")
      .get();
    console.log(result);
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("with soft delete", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .whereNotNull("subscription")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .orWhereNotNull("subscription")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .where("age", 5)
      .whereNotNull("subscription")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete & withTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .whereNotNull("subscription")
      .withTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete, withTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .orWhereNotNull("subscription")
      .withTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete, withTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .where("age", 45)
      .whereNotNull("subscription")
      .withTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete & onlyTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.onlyTrashed()
      .whereNotNull("subscription")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete, onlyTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("balance", 500)
      .orWhereNotNull("subscription")
      .onlyTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete, onlyTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .where("age", 100)
      .whereNotNull("subscription")
      .onlyTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
    User["$useSoftDelete"] = false;
  });
});
