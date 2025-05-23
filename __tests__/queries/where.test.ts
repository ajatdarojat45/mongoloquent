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

describe("Query Builder - Where Clause Tests", () => {
  it("should filter records using where clause with comparison operator", async () => {
    const result = await User.where("balance", ">=", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should filter records using where clause with equality check", async () => {
    const result = await User.where("balance", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should combine multiple where clauses with AND operator", async () => {
    const result = await User.where("balance", 500).where("age", 5).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should combine conditions using OR operator", async () => {
    const result = await User.where("balance", 500).orWhere("age", 5).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should handle combination of AND and OR conditions", async () => {
    const result = await User.where("balance", 500)
      .where("age", 5)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should respect soft delete when filtering records", async () => {
    const result = await UserD.where("balance", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should handle OR conditions with soft delete enabled", async () => {
    const result = await UserD.where("balance", 500)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should handle AND conditions with soft delete enabled", async () => {
    const result = await UserD.where("balance", 500).where("age", 5).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should include soft deleted records when using withTrashed", async () => {
    const result = await UserD.where("balance", 500).withTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should combine withTrashed and OR conditions", async () => {
    const result = await UserD.where("balance", 500)
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should combine withTrashed and AND conditions", async () => {
    const result = await UserD.where("balance", 500)
      .where("age", 45)
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should retrieve only soft deleted records with onlyTrashed", async () => {
    const result = await UserD.onlyTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should combine onlyTrashed with OR conditions", async () => {
    const result = await UserD.where("balance", 500)
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should combine onlyTrashed with AND conditions", async () => {
    const result = await UserD.where("balance", 500)
      .where("age", 100)
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
  });
});
