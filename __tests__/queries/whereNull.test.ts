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

describe("QueryResult - whereNull method", () => {
  it("single condition with operator", async () => {
    const result = await User.whereNull("subscription").get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("with and condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .whereNull("subscription")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("with or condition", async () => {
    const result: any[] = await User.whereNull("subscription")
      .orWhere("age", 5)
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("with and & or condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .where("age", 5)
      .orWhere("name", "Kosasih")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("with soft delete", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500).get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .orWhere("name", "Kosasih")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .where("age", 5)
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete & withTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500).withTrashed().get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete, withTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .orWhere("name", "Kosasih")
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
      .withTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete & onlyTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.onlyTrashed().get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("with soft delete, onlyTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("balance", 500)
      .orWhere("name", "Kosasih")
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
      .onlyTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
    User["$useSoftDelete"] = false;
  });
});
