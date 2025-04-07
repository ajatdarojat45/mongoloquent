import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IUser extends IMongoloquentSchema {
  name: string;
  email: string;
  age: number;
  balance: number;
}
class User extends Model<IUser> {}

const query = User["query"]();
const userCollection = query["getCollection"]();

beforeAll(async () => {
  await userCollection?.deleteMany({});

  await userCollection?.insertMany([
    {
      name: "John",
      email: "john@mail.com",
      age: 10,
      balance: 100,
      [query.getIsDeleted()]: false,
    },
    {
      name: "doe",
      email: "doe@mail.com",
      age: 30,
      balance: 200,
      [query.getIsDeleted()]: false,
    },
    {
      name: "Udin",
      email: "udin@mail.com",
      age: 5,
      balance: 500,
      [query.getIsDeleted()]: false,
    },
    {
      name: "Kosasih",
      email: "kosasih@mail.com",
      age: 5,
      balance: 400,
      [query.getIsDeleted()]: false,
    },
    {
      name: "Joko",
      email: "joko@mail.com",
      age: 45,
      balance: 500,
      [query.getIsDeleted()]: true,
    },
  ]);
});

afterAll(async () => {
  await userCollection?.deleteMany({});
});

describe("Model - whereIn query method", () => {
  it("should return records when using whereIn with single condition", async () => {
    const result = await User.whereIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("whereIn with whereIn", async () => {
    const result = await User.whereIn("balance", [500, 200])
      .whereIn("name", ["Udin"])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("whereIn with where", async () => {
    const result = await User.where("name", "doe")
      .whereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("whereIn with orWhereIn", async () => {
    const result = await User.where("name", "doe")
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("whereIn with orWhere", async () => {
    const result = await User.whereIn("balance", [500, 200])
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("whereIn with orWhereIn", async () => {
    const result = await User.whereIn("balance", [500, 200])
      .orWhereIn("name", ["Kosasih"])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("whereIn with soft delete", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["$useSoftDelete"] = false;
  });

  it("whereIn with soft delete & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereIn("balance", [500, 200])
      .where("name", "Udin")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("whereIn with soft delete & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereIn("balance", [500, 200])
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["$useSoftDelete"] = false;
  });

  it("whereIn with soft delete, withTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereIn("balance", [500, 200])
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["$useSoftDelete"] = false;
  });

  it("whereIn with soft delete, withTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereIn("balance", [500, 200])
      .where("age", 5)
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("whereIn with soft delete & onlyTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereIn("balance", [500, 200])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("whereIn with soft delete, onlyTrashed & or condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereIn("balance", [500, 200])
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["$useSoftDelete"] = false;
  });

  it("whereIn with soft delete, onlyTrashed & and condition", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.whereIn("balance", [500, 200])
      .where("age", 100)
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["$useSoftDelete"] = false;
  });
});
