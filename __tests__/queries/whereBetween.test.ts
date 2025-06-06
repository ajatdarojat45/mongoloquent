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
  static $schema: IUser;
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

describe("Model.whereBetween() Query Builder Tests", () => {
  it("should filter records with balance between 400 and 500", async () => {
    const result = await User.whereBetween("balance", [400, 500]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should filter records with age between 5-10 AND balance between 400-500", async () => {
    const result = await User.whereBetween("age", [5, 10])
      .whereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should filter records with age between 5-10 OR balance between 400-500", async () => {
    const result = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should filter records with age=5 OR balance between 400-500 OR name=doe", async () => {
    const result = await User.where("age", 5)
      .orWhereBetween("balance", [400, 500])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should respect soft delete when filtering balance between 400-500", async () => {
    const result = await UserD.whereBetween("balance", [400, 500]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should respect soft delete when filtering age=5 AND balance between 400-500", async () => {
    const result = await UserD.where("age", 5)
      .whereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should respect soft delete when filtering age between 5-10 OR balance between 200-500", async () => {
    const result = await UserD.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [200, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should include deleted records when using withTrashed and age between 5-10", async () => {
    const result = await UserD.whereBetween("age", [5, 10]).withTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should include deleted records when filtering age=5 AND balance between 400-500 with withTrashed", async () => {
    const result = await UserD.where("age", 5)
      .whereBetween("balance", [400, 500])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should include deleted records when filtering age between 5-10 OR balance between 200-500 with withTrashed", async () => {
    const result = await UserD.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [200, 500])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
  });

  it("should only return deleted records with age between 5-50", async () => {
    const result = await UserD.whereBetween("age", [5, 50]).onlyTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should only return deleted records when filtering age=5 AND balance between 400-500", async () => {
    const result = await UserD.where("age", 5)
      .whereBetween("balance", [400, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
  });

  it("should only return deleted records when filtering age between 5-10 OR balance between 200-500", async () => {
    const result = await UserD.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [200, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should handle single value in whereBetween range array", async () => {
    const result = await User.whereBetween("age", [5]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });
});
