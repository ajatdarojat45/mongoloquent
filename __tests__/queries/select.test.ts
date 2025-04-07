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

describe("Select Query - Field Selection Methods", () => {
  it("should select single field using string parameter", async () => {
    const result = await User.select("name").first();

    expect(result).toEqual(expect.any(Object));
    expect(result?.name).toBeDefined();
    expect(result?.email).toBeUndefined();
    expect(result?.age).toBeUndefined();
    expect(result?.balance).toBeUndefined();
    expect(result?.[query.getIsDeleted()]).toBeUndefined();
  });

  it("should select multiple fields using array parameter", async () => {
    const result = await User.select(["name", "age"]).first();

    expect(result).toEqual(expect.any(Object));
    expect(result?.name).toBeDefined();
    expect(result?.email).toBeUndefined();
    expect(result?.age).toBeDefined();
    expect(result?.balance).toBeUndefined();
    expect(result?.[query.getIsDeleted()]).toBeUndefined();
  });

  it("should combine multiple select calls to get multiple fields", async () => {
    const result = await User.select("name").select(["age", "email"]).first();

    expect(result).toEqual(expect.any(Object));
    expect(result?.name).toBeDefined();
    expect(result?.email).toBeDefined();
    expect(result?.age).toBeDefined();
    expect(result?.balance).toBeUndefined();
    expect(result?.[query.getIsDeleted()]).toBeUndefined();
  });
});
