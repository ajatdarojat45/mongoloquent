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

describe("Model - orWhereIn Query Builder Tests", () => {
  it("should filter records using single orWhereIn condition", async () => {
    const result = await User.orWhereIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should filter records using multiple orWhereIn conditions", async () => {
    const result = await User.orWhereIn("balance", [500, 200])
      .orWhereIn("age", [5])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should combine where and orWhereIn conditions correctly", async () => {
    const result = await User.where("balance", 500)
      .orWhereIn("age", [45, 10])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should combine whereIn and orWhereIn conditions correctly", async () => {
    const result = await User.whereIn("balance", [500, 200])
      .orWhereIn("age", [5])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should respect soft delete when using orWhereIn", async () => {
    const result = await UserD.whereIn("age", [10])
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should combine soft delete with where and orWhereIn conditions", async () => {
    const result = await UserD.where("age", 10)
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should combine soft delete with orWhere and orWhereIn conditions", async () => {
    const result = await UserD.where("name", "Kosasih")
      .orWhere("age", 10)
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should include deleted records when using withTrashed with orWhereIn", async () => {
    const result = await UserD.whereIn("age", [10])
      .orWhereIn("balance", [500, 200])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should combine withTrashed, where, and orWhereIn conditions", async () => {
    const result = await UserD.where("age", 10)
      .orWhereIn("balance", [500, 200])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should filter only deleted records when using onlyTrashed with orWhereIn", async () => {
    const result = await UserD.whereIn("age", [10])
      .orWhereIn("balance", [500, 200])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should combine onlyTrashed with where and orWhereIn conditions", async () => {
    const result = await UserD.where("age", 10)
      .orWhereIn("balance", [500, 200])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should combine onlyTrashed with multiple conditions including orWhereIn", async () => {
    const result = await UserD.where("name", "Kosasih")
      .orWhere("age", 10)
      .orWhereIn("balance", [500, 200])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });
});
