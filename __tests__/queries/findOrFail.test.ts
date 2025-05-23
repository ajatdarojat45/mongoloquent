import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IUser extends IMongoloquentSchema {
  name: string;
  email: string;
  age: number;
  balance: number;
}
class User extends Model<IUser> {
  static $schema: IUser;
  protected $useSoftDelete = true;
}

const query = User["query"]();
const userCollection = query["getCollection"]();
let userIds: any = [];

beforeAll(async () => {
  await userCollection?.deleteMany({});

  const insertedUsers = await userCollection?.insertMany([
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
  userIds = insertedUsers?.insertedIds;
});

afterAll(async () => {
  await userCollection?.deleteMany({});
});

describe("findOrFail", () => {
  it("should find and return a single document using findOrFail", async () => {
    const result = await User.findOrFail(userIds[0]);

    expect(result).toBeInstanceOf(User);
    expect(result.name).toBe("John");
  });

  it("should throw an error if the document is not found", async () => {
    await expect(User.findOrFail("6810a4c46af3446182e8d7fe")).rejects.toThrow(
      "Not found",
    );
  });
});
