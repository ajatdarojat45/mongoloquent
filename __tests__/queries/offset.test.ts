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

describe("QueryResult - offset method", () => {
  it("offset without condition", async () => {
    const result: any[] = await User.offset(2).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("offset with where condition", async () => {
    const result: any[] = await User.where("age", 5).offset(1).get();
    console.log(result);
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("offset with or condition", async () => {
    const result: any[] = await User.orWhere("IS_DELETED", false)
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("offset with and condition", async () => {
    const result: any[] = await User.where("age", 5)
      .where("IS_DELETED", false)
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("offset with and & or condition", async () => {
    const result: any[] = await User.where("age", 5)
      .where("IS_DELETED", false)
      .orWhere("balance", 500)
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("offset with whereBetween", async () => {
    const result: any[] = await User.whereBetween("age", [5, 10])
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("offset with limit", async () => {
    const result: any[] = await User.limit(2).offset(1).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("offset with limit soft delete", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.limit(2).offset(3).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.offset(2).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete & where condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5).offset(1).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhere("IS_DELETED", false)
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .where("IS_DELETED", false)
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete & and & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .where("Name", "Udin")
      .orWhere("balance", 500)
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete & whereBetween", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete & withTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.withTrashed().offset(1).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete, withTrashed & where condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .withTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete, withTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhere("IS_DELETED", false)
      .withTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete, withTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .where("IS_DELETED", false)
      .withTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete, withTrashed & and & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .where("name", "Kosasih")
      .orWhere("balance", 500)
      .withTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete & onlyTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.onlyTrashed().offset(1).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete, onlyTrashed & where condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 45)
      .onlyTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete, onlyTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhere("balance", 500)
      .onlyTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });

  it("offset with soft delete, onlyTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 45)
      .where("balance", 500)
      .onlyTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });
});
