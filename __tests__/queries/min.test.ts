import Model from "../../src/Model";

class User extends Model {}

const query = User["query"]();
const userCollection = query["getCollection"]();

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    [query.getIsDeleted()]: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    [query.getIsDeleted()]: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    [query.getIsDeleted()]: true,
    age: 50,
  },
];

beforeEach(async () => {
  try {
    await userCollection.insertMany(users);
  } catch (error) {
    console.error(error);
  }
});

afterEach(async () => {
  try {
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - min method", () => {
  it("should return the minimum value of the specified field", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("should return the minimum value of the specified field considering soft delete", async () => {
    User["$useSoftDelete"] = true;

    const user = await User.withTrashed().get();
    const result = await User.min("age");
    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("should return the minimum value of the specified field with a where condition", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Kosasih").min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(50);
  });

  it("should return 0 when no matching data is found", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Udin1").min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });

  it("should return 0 when the specified field is not a number", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.min("name");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});
