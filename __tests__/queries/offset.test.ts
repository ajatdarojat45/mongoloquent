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

describe("Offset Query Tests - Pagination and Result Skipping", () => {
  it("should skip first 2 records when using offset without conditions", async () => {
    const result: any[] = await User.offset(2).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should skip first record when using offset with where condition", async () => {
    const result: any[] = await User.where("age", 5).offset(1).get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should skip first record when using offset with or condition", async () => {
    const result: any[] = await User.orWhere(User.getIsDeleted(), false)
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should skip first record when using offset with and condition", async () => {
    const result: any[] = await User.where("age", 5)
      .where(User.getIsDeleted(), false)
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should skip first record when using offset with and & or condition", async () => {
    const result: any[] = await User.where("age", 5)
      .where(User.getIsDeleted(), false)
      .orWhere("balance", 500)
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should skip first record when using offset with whereBetween", async () => {
    const result: any[] = await User.whereBetween("age", [5, 10])
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should skip first record when using offset with limit", async () => {
    const result: any[] = await User.limit(2).offset(1).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should skip first 3 records when using offset with limit and soft delete", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.limit(2).offset(3).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should skip first 2 records when using offset with soft delete", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.offset(2).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete and where condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5).offset(1).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete and or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhere(Model["$isDeleted"], false)
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete and and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .where(User.getIsDeleted(), false)
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete and and & or condition", async () => {
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

  it("should skip first record when using offset with soft delete and whereBetween", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete and withTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.withTrashed().offset(1).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete, withTrashed and where condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .withTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete, withTrashed and or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhere(User.getIsDeleted(), false)
      .withTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete, withTrashed and and condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .where(User.getIsDeleted(), false)
      .withTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete, withTrashed and and & or condition", async () => {
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

  it("should skip first record when using offset with soft delete and onlyTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.onlyTrashed().offset(1).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete, onlyTrashed and where condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 45)
      .onlyTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete, onlyTrashed and or condition", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.orWhere("balance", 500)
      .onlyTrashed()
      .offset(1)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });

  it("should skip first record when using offset with soft delete, onlyTrashed and and condition", async () => {
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
