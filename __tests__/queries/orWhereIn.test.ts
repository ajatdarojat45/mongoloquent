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

describe("Model - orWhereIn Query Builder Tests", () => {
  it("should filter records using single orWhereIn condition", async () => {
    const result: any[] = await User.orWhereIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should filter records using multiple orWhereIn conditions", async () => {
    const result: any[] = await User.orWhereIn("balance", [500, 200])
      .orWhereIn("age", [5])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should combine where and orWhereIn conditions correctly", async () => {
    const result: any[] = await User.where("balance", 500)
      .orWhereIn("age", [45, 10])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should combine whereIn and orWhereIn conditions correctly", async () => {
    const result: any[] = await User.whereIn("balance", [500, 200])
      .orWhereIn("age", [5])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should respect soft delete when using orWhereIn", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereIn("age", [10])
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should combine soft delete with where and orWhereIn conditions", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 10)
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should combine soft delete with orWhere and orWhereIn conditions", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("name", "Kosasih")
      .orWhere("age", 10)
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("should include deleted records when using withTrashed with orWhereIn", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereIn("age", [10])
      .orWhereIn("balance", [500, 200])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("should combine withTrashed, where, and orWhereIn conditions", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 10)
      .orWhereIn("balance", [500, 200])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("should filter only deleted records when using onlyTrashed with orWhereIn", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.whereIn("age", [10])
      .orWhereIn("balance", [500, 200])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should combine onlyTrashed with where and orWhereIn conditions", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("age", 10)
      .orWhereIn("balance", [500, 200])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should combine onlyTrashed with multiple conditions including orWhereIn", async () => {
    User["$useSoftDelete"] = true;
    const result: any[] = await User.where("name", "Kosasih")
      .orWhere("age", 10)
      .orWhereIn("balance", [500, 200])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });
});
