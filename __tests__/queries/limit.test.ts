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

describe("QueryResult - limit method", () => {
  it("limit without condition", async () => {
    const result: any[] = await User.limit(2).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("limit with and condition", async () => {
    const result: any[] = await User.where("age", 5)
      .where(Model["$isDeleted"], false)
      .limit(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("limit with or condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .orWhere("age", 30)
      .limit(2)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("limit with and & or condition", async () => {
    const result: any[] = await User.where("age", 5)
      .orWhere("balance", 500)
      .limit(2)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("limit with whereBetween", async () => {
    const result: any[] = await User.whereBetween("age", [5, 10])
      .limit(2)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("limit with soft delete", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.limit(2).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("limit with soft delete & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .where(Model["$isDeleted"], false)
      .limit(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("limit with soft delete & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .orWhere("age", 30)
      .limit(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("limit with soft delete & and & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .orWhere("balance", 500)
      .limit(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("limit with soft delete & whereBetween", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .limit(2)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("limit with soft delete, withTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.limit(2).withTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("limit with soft delete, withTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 45)
      .where("balance", 500)
      .withTrashed()
      .limit(2)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("limit with soft delete, withTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 45)
      .orWhere("balance", 500)
      .withTrashed()
      .limit(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("limit with soft delete, onlyTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.limit(2).onlyTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("limit with soft delete, onlyTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 45)
      .where("balance", 500)
      .onlyTrashed()
      .limit(2)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("limit with soft delete, onlyTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 45)
      .orWhere("balance", 500)
      .onlyTrashed()
      .limit(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });
});
