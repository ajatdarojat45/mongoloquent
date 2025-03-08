import Model from "../../src/Model";

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    [Model["$isDeleted"]]: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    [Model["$isDeleted"]]: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    [Model["$isDeleted"]]: true,
    age: 50,
  },
];

class User extends Model {
  static $collection = "users";
}

beforeAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
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

describe("User Model - paginate method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return paginated users without soft delete", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.paginate(1, 3);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("data", expect.any(Array));
    expect(result.data.length).toBe(3);
    expect(result.data[0]).toEqual(expect.any(Object));

    expect(result).toHaveProperty("meta", expect.any(Object));
    expect(result.meta).toHaveProperty("page", 1);
    expect(result.meta).toHaveProperty("limit", 3);
    expect(result.meta).toHaveProperty("total", 3);
    expect(result.meta).toHaveProperty("lastPage", 1);
  });

  it("should return paginated users with soft delete enabled", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.paginate(1, 3);
    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("data", expect.any(Array));
    expect(result.data.length).toBe(2); // Only 2 users should be returned as one is soft deleted
    expect(result.data[0]).toEqual(expect.any(Object));

    expect(result).toHaveProperty("meta", expect.any(Object));
    expect(result.meta).toHaveProperty("page", 1);
    expect(result.meta).toHaveProperty("limit", 3);
    expect(result.meta).toHaveProperty("total", 2);
    expect(result.meta).toHaveProperty("lastPage", 1);
  });

  it("should return paginated users for the second page without soft delete", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.paginate(2, 2);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("data", expect.any(Array));
    expect(result.data.length).toBe(1); // Only 1 user should be returned on the second page
    expect(result.data[0]).toEqual(expect.any(Object));

    expect(result).toHaveProperty("meta", expect.any(Object));
    expect(result.meta).toHaveProperty("page", 2);
    expect(result.meta).toHaveProperty("limit", 2);
    expect(result.meta).toHaveProperty("total", 3);
    expect(result.meta).toHaveProperty("lastPage", 2);
  });
});
