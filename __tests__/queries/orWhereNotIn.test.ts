import Model from "../../src/Model";

class User extends Model {}

const builder = User["build"]();
const userCollection = builder["getCollection"]();

beforeAll(async () => {
  await userCollection?.deleteMany({});

  await userCollection?.insertMany([
    {
      name: "John",
      email: "john@mail.com",
      age: 10,
      balance: 100,
      [builder.getIsDeleted()]: false,
    },
    {
      name: "doe",
      email: "doe@mail.com",
      age: 30,
      balance: 200,
      [builder.getIsDeleted()]: false,
    },
    {
      name: "Udin",
      email: "udin@mail.com",
      age: 5,
      balance: 500,
      [builder.getIsDeleted()]: false,
    },
    {
      name: "Kosasih",
      email: "kosasih@mail.com",
      age: 5,
      balance: 400,
      [builder.getIsDeleted()]: false,
    },
    {
      name: "Joko",
      email: "joko@mail.com",
      age: 45,
      balance: 500,
      [builder.getIsDeleted()]: true,
    },
  ]);
});

afterAll(async () => {
  await userCollection?.deleteMany({});
});

describe("Model - orWhereNotIn Query Builder Method", () => {
  it("should filter records not in given array using orWhereNotIn", async () => {
    const result = await User.orWhereNotIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should combine where and orWhereNotIn conditions", async () => {
    const result = await User.where("age", 5)
      .orWhereNotIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should combine orWhereNotIn with orWhere conditions", async () => {
    const result = await User.orWhereNotIn("balance", [500, 200])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should combine where, orWhereNotIn and orWhere conditions", async () => {
    const result = await User.where("age", 5)
      .orWhereNotIn("balance", [500, 200])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should combine whereIn with orWhereNotIn conditions", async () => {
    const result = await User.whereIn("balance", [500, 200])
      .orWhereNotIn("age", [5, 10, 30])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should combine whereNotIn with orWhereNotIn conditions", async () => {
    const result = await User.whereNotIn("balance", [500, 200])
      .orWhereNotIn("name", ["doe"])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should handle orWhereNotIn with soft delete enabled", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereNotIn("balance", [100, 200, 400])
      .orWhereNotIn("name", ["John"])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should combine where and orWhereNotIn with soft delete enabled", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("age", 5)
      .orWhereNotIn("balance", [100, 200, 400])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("should combine orWhereNotIn and orWhere with soft delete enabled", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("should handle orWhereNotIn with withTrashed option", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.orWhereNotIn("balance", [100, 200, 400])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("should combine where and orWhereNotIn with withTrashed option", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.orWhereNotIn("balance", [100, 200, 400, 500])
      .where("name", "Joko")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should combine orWhereNotIn and orWhere with withTrashed option", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.orWhereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should handle orWhereNotIn with onlyTrashed option", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.orWhereNotIn("balance", [100, 200, 400])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should combine where and orWhereNotIn with onlyTrashed option", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("age", 5)
      .orWhereNotIn("balance", [100, 200, 400, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });

  it("should combine orWhereNotIn and orWhere with onlyTrashed option", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });
});
