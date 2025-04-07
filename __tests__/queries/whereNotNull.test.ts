import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IUser extends IMongoloquentSchema {
  name: string;
  email: string;
  age: number;
  balance: number;
  subscription: boolean | null;
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
      subscription: null,
    },
    {
      name: "doe",
      email: "doe@mail.com",
      age: 30,
      balance: 200,
      [query.getIsDeleted()]: false,
      subscription: null,
    },
    {
      name: "Udin",
      email: "udin@mail.com",
      age: 5,
      balance: 500,
      [query.getIsDeleted()]: false,
      subscription: null,
    },
    {
      name: "Kosasih",
      email: "kosasih@mail.com",
      age: 5,
      balance: 400,
      [query.getIsDeleted()]: false,
      subscription: true,
    },
    {
      name: "Joko",
      email: "joko@mail.com",
      age: 45,
      balance: 500,
      [query.getIsDeleted()]: true,
      subscription: true,
    },
  ]);
});

afterAll(async () => {
  await userCollection?.deleteMany({});
});

describe("Model - whereNotNull Query Tests", () => {
  it("should return records where specified field is not null", async () => {
    const result = await User.whereNotNull("subscription").get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should combine whereNotNull with where clause using AND", async () => {
    const result = await User.where("balance", 500)
      .whereNotNull("subscription")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("should combine whereNotNull with where clause using OR", async () => {
    const result = await User.whereNotNull("subscription")
      .orWhere("age", 5)
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should handle complex query with AND and OR conditions", async () => {
    const result = await User.where("balance", 500)
      .where("age", 5)
      .orWhereNotNull("subscription")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("should respect soft delete when using whereNotNull", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("balance", 500)
      .whereNotNull("subscription")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
    User["$useSoftDelete"] = false;
  });

  it("should handle soft delete with OR conditions", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("balance", 500)
      .orWhereNotNull("subscription")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
    User["$useSoftDelete"] = false;
  });

  it("should handle soft delete with AND conditions", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("balance", 500)
      .where("age", 5)
      .whereNotNull("subscription")
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
    User["$useSoftDelete"] = false;
  });

  it("should include soft deleted records when using withTrashed", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("balance", 500)
      .whereNotNull("subscription")
      .withTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("should combine withTrashed and OR conditions correctly", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("balance", 500)
      .orWhereNotNull("subscription")
      .withTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
    User["$useSoftDelete"] = false;
  });

  it("should combine withTrashed and AND conditions correctly", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("balance", 500)
      .where("age", 45)
      .whereNotNull("subscription")
      .withTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("should return only soft deleted records with whereNotNull", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.onlyTrashed().whereNotNull("subscription").get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("should handle onlyTrashed with OR conditions", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("balance", 500)
      .orWhereNotNull("subscription")
      .onlyTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
    User["$useSoftDelete"] = false;
  });

  it("should handle onlyTrashed with AND conditions", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("balance", 500)
      .where("age", 100)
      .whereNotNull("subscription")
      .onlyTrashed()
      .get();
    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);
    User["$useSoftDelete"] = false;
  });
});
