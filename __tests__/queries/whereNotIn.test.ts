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

describe("Model - whereNotIn Query Tests", () => {
  it("should filter records with single whereNotIn condition", async () => {
    const result = await User.whereNotIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should filter records with multiple whereNotIn conditions", async () => {
    const result = await User.whereNotIn("balance", [500, 200])
      .whereNotIn("age", [5])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should combine where and whereNotIn conditions", async () => {
    const result = await User.where("balance", 500)
      .whereNotIn("age", [45, 10])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should combine whereNotIn with orWhereIn conditions", async () => {
    const result = await User.whereNotIn("age", [5, 10])
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should combine whereNotIn with orWhereNotIn conditions", async () => {
    const result = await User.whereNotIn("age", [5, 10])
      .orWhereNotIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should combine whereIn with whereNotIn conditions", async () => {
    const result = await User.whereIn("balance", [500, 200])
      .whereNotIn("age", [5, 10, 30])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should handle whereNotIn with soft delete enabled", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereNotIn("balance", [100, 200, 400]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should handle whereNotIn with soft delete and additional where condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereNotIn("balance", [100, 200, 400])
      .where("name", "!=", "Udin")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });

  it("should handle whereNotIn with soft delete and or condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("should handle whereNotIn with withTrashed option", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereNotIn("balance", [100, 200, 400])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("should handle whereNotIn with withTrashed and additional where condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereNotIn("balance", [100, 200, 400])
      .where("name", "Udin")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should handle whereNotIn with withTrashed and or condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should handle whereNotIn with onlyTrashed option", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereNotIn("balance", [100, 200, 400])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should handle whereNotIn with onlyTrashed and additional where condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereNotIn("balance", [100, 200, 400])
      .where("name", "Udin")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });

  it("should handle whereNotIn with onlyTrashed and or condition", async () => {
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
