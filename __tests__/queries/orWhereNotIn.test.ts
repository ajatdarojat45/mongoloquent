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

describe("QueryResult - orWhereNotIn method", () => {
  it("orWhereNotIn with single condition", async () => {
    const result: any[] = await User.orWhereNotIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("orWhereNotIn with and condition", async () => {
    const result: any[] = await User.where("age", 5)
      .orWhereNotIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhereNotIn with or condition", async () => {
    const result: any[] = await User.orWhereNotIn("balance", [500, 200])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhereNotIn with and & or condition", async () => {
    const result: any[] = await User.where("age", 5)
      .orWhereNotIn("balance", [500, 200])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereNotIn with whereIn", async () => {
    const result: any[] = await User.whereIn("balance", [500, 200])
      .orWhereNotIn("age", [5, 10, 30])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhereNotIn with whereNotIn", async () => {
    const result: any[] = await User.whereNotIn("balance", [500, 200])
      .orWhereNotIn("name", ["doe"])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereNotIn with soft delete", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .orWhereNotIn("name", ["John"])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("orWhereNotIn with soft delete & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .orWhereNotIn("balance", [100, 200, 400])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("orWhereNotIn with soft delete & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("orWhereNotIn with soft delete & withTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhereNotIn("balance", [100, 200, 400])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("orWhereNotIn with soft delete, withTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhereNotIn(
      "balance",
      [100, 200, 400, 500]
    )
      .where("name", "Joko")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("orWhereNotIn with soft delete, withTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("orWhereNotIn with soft delete, onlyTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhereNotIn("balance", [100, 200, 400])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("orWhereNotIn with soft delete, onlyTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .orWhereNotIn("balance", [100, 200, 400, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });

  it("orWhereNotIn with soft delete, onlyTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });
});
