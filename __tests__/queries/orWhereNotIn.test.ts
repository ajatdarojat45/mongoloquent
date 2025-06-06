import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IUser extends IMongoloquentSchema {
  name: string;
  email: string;
  age: number;
  balance: number;
}
class User extends Model<IUser> {}

class UserD extends Model<IUser> {
  protected $useSoftDelete = true;
  protected $collection: string = "users";
}

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
    const result = await UserD.whereNotIn("balance", [100, 200, 400])
      .orWhereNotIn("name", ["John"])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should combine where and orWhereNotIn with soft delete enabled", async () => {
    const result = await UserD.where("age", 5)
      .orWhereNotIn("balance", [100, 200, 400])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should combine orWhereNotIn and orWhere with soft delete enabled", async () => {
    const result = await UserD.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should handle orWhereNotIn with withTrashed option", async () => {
    const result = await UserD.orWhereNotIn("balance", [100, 200, 400])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should combine where and orWhereNotIn with withTrashed option", async () => {
    const result = await UserD.orWhereNotIn("balance", [100, 200, 400, 500])
      .where("name", "Joko")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should combine orWhereNotIn and orWhere with withTrashed option", async () => {
    const result = await UserD.orWhereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should handle orWhereNotIn with onlyTrashed option", async () => {
    const result = await UserD.orWhereNotIn("balance", [100, 200, 400])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should combine where and orWhereNotIn with onlyTrashed option", async () => {
    const result = await UserD.where("age", 5)
      .orWhereNotIn("balance", [100, 200, 400, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
  });

  it("should combine orWhereNotIn and orWhere with onlyTrashed option", async () => {
    const result = await UserD.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });
});
