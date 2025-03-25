import Model from "../../src/Model";

class User extends Model {}

const query = User["query"]();
const userCollection = query["getCollection"]();

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    [query["$isDeleted"]]: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    [query["$isDeleted"]]: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    [query["$isDeleted"]]: true,
    age: 50,
  },
];

// Clear the collection before all tests
beforeAll(async () => {
  try {
    await userCollection?.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

// Clear the collection after all tests
afterAll(async () => {
  try {
    await userCollection?.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - first method", () => {
  // Insert test data before each test
  beforeAll(async () => {
    try {
      await userCollection?.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  // Clear test data after each test
  afterAll(async () => {
    try {
      await userCollection?.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return the first user matching the query", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Kosasih").first();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Kosasih");
  });

  it("should return the first user with only the selected field", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Kosasih").first("name");
    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Kosasih");
    expect(result).not.toHaveProperty("age");
    expect(result).not.toHaveProperty("email");
  });

  it("should return the first user with the selected fields", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Kosasih").first(["name", "age"]);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Kosasih");
    expect(result).toHaveProperty("age", 50);
    expect(result).not.toHaveProperty("email");
  });

  it("should return null for a non-existent user", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.where("name", "Kosasih1").first();

    expect(result).toEqual(null);
  });

  it("should return null for a soft-deleted user", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.where("name", "Kosasih").first();

    expect(result).toEqual(null);
  });
});
