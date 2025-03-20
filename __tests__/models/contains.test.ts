import Model from "../../src/Model";

class User extends Model {
  static $collection = "users";
}

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    [User.getIsDeleted()]: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    [User.getIsDeleted()]: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    [User.getIsDeleted()]: true,
    age: 50,
  },
];

beforeAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.insertMany(users);
  } catch (error) {
    console.error(error);
  }
});

afterAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("Model.contains", () => {
  it("should return true if a document contains the specified value", async () => {
    const result = await User.contains("John Doe");
    expect(result).toBe(true);
  });

  it("should return false if no document contains the specified value", async () => {
    const result = await User.contains("John Doe 2");
    expect(result).toBe(false);
  });

  it("With softdelete", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.contains("Kosasih");
    expect(result).toBe(false);
    User["$useSoftDelete"] = false;
  });
});
