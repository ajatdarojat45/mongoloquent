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
      age: 5,
      balance: 500,
      [User.getIsDeleted()]: true,
    },
  ]);
});

afterAll(async () => {
  await userCollection.deleteMany({});
});

describe("QueryBuilder - whereNot() method tests", () => {
  it("should return records that don't match the given value", async () => {
    const result: any[] = await User.whereNot("balance", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should handle multiple whereNot conditions with AND operator", async () => {
    const result: any[] = await User.whereNot("balance", 500)
      .whereNot("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should combine where and whereNot conditions correctly", async () => {
    const result: any[] = await User.where("balance", 500)
      .whereNot("name", "Udin")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should handle whereNot with orWhereNot conditions", async () => {
    const result: any[] = await User.whereNot("balance", 500)
      .orWhereNot("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
  });

  it("should combine whereNot with orWhere conditions", async () => {
    const result: any[] = await User.whereNot("balance", 500)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should respect soft delete when using whereNot", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereNot("balance", 400).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should handle soft delete with whereNot and where conditions", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereNot("balance", 500)
      .where("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should handle soft delete with whereNot and orWhere conditions", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereNot("balance", 500)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should include trashed records when using withTrashed and orWhere", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereNot("balance", 100)
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("should include trashed records when using withTrashed and where", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereNot("balance", 500)
      .where("age", 5)
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should only return trashed records with whereNot", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereNot("balance", 200)
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should handle onlyTrashed with whereNot and orWhere conditions", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereNot("balance", 200)
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should handle onlyTrashed with whereNot and where conditions", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereNot("balance", 200)
      .where("age", 100)
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });
});
