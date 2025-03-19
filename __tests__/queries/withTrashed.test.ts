import Model from "../../src/Model";

class User extends Model {
  static $collection = "users";
  static $useSoftDelete: boolean = true;
}

const userCollection = User["getCollection"]();

beforeAll(async () => {
  await userCollection.deleteMany({});

  await userCollection.insertMany([
    {
      name: "John",
      email: "john@mail.com",
      age: 10,
      balance: 100,
      [User.getIsDeleted()]: false,
    },
    {
      name: "doe",
      email: "doe@mail.com",
      age: 30,
      balance: 200,
      [User.getIsDeleted()]: false,
    },
    {
      name: "Udin",
      email: "udin@mail.com",
      age: 5,
      balance: 500,
      [User.getIsDeleted()]: false,
    },
    {
      name: "Kosasih",
      email: "kosasih@mail.com",
      age: 5,
      balance: 400,
      [User.getIsDeleted()]: false,
    },
    {
      name: "Joko",
      email: "joko@mail.com",
      age: 45,
      balance: 500,
      [User.getIsDeleted()]: true,
    },
  ]);
});

afterAll(async () => {
  await userCollection.deleteMany({});
});

describe("Query Builder - withTrashed() method", () => {
  it("should include soft deleted records when using withTrashed() and exclude them by default", async () => {
    const withTrashed = await User.withTrashed().get();
    const withoutTrashed = await User.get();

    expect(withoutTrashed).toEqual(expect.any(Array));
    expect(withoutTrashed).toHaveLength(4);
    expect(withTrashed).toEqual(expect.any(Array));
    expect(withTrashed).toHaveLength(5);
  });
});
