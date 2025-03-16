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

describe("QueryResult - whereNotBetween method", () => {
  it("orWhereBetween with single condition", async () => {
    const result: any[] = await User.orWhereBetween(
      "balance",
      [400, 500]
    ).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhereBetween with and condition", async () => {
    const result: any[] = await User.orWhereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereBetween with or condition", async () => {
    const result: any[] = await User.orWhereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereBetween with and & or condition", async () => {
    const result: any[] = await User.orWhere("age", 5)
      .orWhereBetween("balance", [400, 500])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereBetween with whereBetween", async () => {
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereBetween with soft delete", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhereBetween(
      "balance",
      [400, 500]
    ).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("orWhereBetween with soft delete & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("orWhereBetween with soft delete & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("orWhereBetween with soft delete & withTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhereBetween("age", [5, 10])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("orWhereBetween with soft delete, withTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .orWhereBetween("balance", [400, 500])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("orWhereBetween with soft delete, withTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("orWhereBetween with soft delete, onlyTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 50])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("orWhereBetween with soft delete, onlyTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .orWhereBetween("balance", [400, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("orWhereBetween with soft delete, onlyTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [200, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("orWhereBetween with values length < 2", async () => {
    const result = await User.orWhereBetween("age", [5]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });
});
