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
      age: 5,
      balance: 500,
      [query.getIsDeleted()]: true,
    },
  ]);
});

afterAll(async () => {
  await userCollection?.deleteMany({});
});

describe("QueryBuilder - whereNot() method tests", () => {
  it("should return records that don't match the given value", async () => {
    const result = await User.whereNot("balance", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should handle multiple whereNot conditions with AND operator", async () => {
    const result = await User.whereNot("balance", 500)
      .whereNot("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should combine where and whereNot conditions correctly", async () => {
    const result = await User.where("balance", 500)
      .whereNot("name", "Udin")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should handle whereNot with orWhereNot conditions", async () => {
    const result = await User.whereNot("balance", 500)
      .orWhereNot("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
  });

  it("should combine whereNot with orWhere conditions", async () => {
    const result = await User.whereNot("balance", 500)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should respect soft delete when using whereNot", async () => {
    const result = await UserD.whereNot("balance", 400).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should handle soft delete with whereNot and where conditions", async () => {
    const result = await UserD.whereNot("balance", 500)
      .where("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should handle soft delete with whereNot and orWhere conditions", async () => {
    const result = await UserD.whereNot("balance", 500)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should include trashed records when using withTrashed and orWhere", async () => {
    const result = await UserD.whereNot("balance", 100)
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("should include trashed records when using withTrashed and where", async () => {
    const result = await UserD.whereNot("balance", 500)
      .where("age", 5)
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should only return trashed records with whereNot", async () => {
    const result = await UserD.whereNot("balance", 200).onlyTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should handle onlyTrashed with whereNot and orWhere conditions", async () => {
    const result = await UserD.whereNot("balance", 200)
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should handle onlyTrashed with whereNot and where conditions", async () => {
    const result = await UserD.whereNot("balance", 200)
      .where("age", 100)
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
  });
});
