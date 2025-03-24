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

describe("QueryBuilder - orWhereBetween method", () => {
  it("should filter records using single orWhereBetween condition", async () => {
    const result = await User.orWhereBetween("balance", [400, 500]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should filter records using multiple orWhereBetween conditions", async () => {
    const result = await User.orWhereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should filter records using multiple orWhereBetween conditions with OR logic", async () => {
    const result = await User.orWhereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should combine orWhereBetween with orWhere conditions", async () => {
    const result = await User.orWhere("age", 5)
      .orWhereBetween("balance", [400, 500])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should combine whereBetween with orWhereBetween conditions", async () => {
    const result = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should apply soft delete with orWhereBetween", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.orWhereBetween("balance", [400, 500]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("should combine soft delete with multiple orWhereBetween conditions", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.orWhereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("should combine soft delete with whereBetween and orWhereBetween", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should include soft deleted records with withTrashed and orWhereBetween", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.orWhereBetween("age", [5, 10])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should combine withTrashed, soft delete and mixed conditions", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("age", 5)
      .orWhereBetween("balance", [400, 500])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("should combine withTrashed, soft delete and multiple between conditions", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("should filter only soft deleted records with onlyTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereBetween("age", [5, 50]).onlyTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should combine onlyTrashed with mixed conditions", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("age", 5)
      .orWhereBetween("balance", [400, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should combine onlyTrashed with multiple between conditions", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [200, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("should handle orWhereBetween with incomplete range values", async () => {
    const result = await User.orWhereBetween("age", [5]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });
});
