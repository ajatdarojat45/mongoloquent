import Model from "../../src/Model";

class User extends Model {}

const builder = User["build"]();
const userCollection = builder["getCollection"]();

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    [builder["$isDeleted"]]: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    [builder["$isDeleted"]]: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    [builder["$isDeleted"]]: true,
    age: 50,
  },
];

beforeAll(async () => {
  try {
    await userCollection?.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

afterAll(async () => {
  try {
    await userCollection?.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("Model - get method", () => {
  beforeAll(async () => {
    try {
      await userCollection?.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection?.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return all users without soft delete", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.get();

    expect(result?.length).toBe(3);
    expect(result).toEqual(expect.any(Array));
    expect(result?.[0]).toEqual(expect.any(Object));
  });

  it("should return all users excluding soft deleted ones", async () => {
    User["$useSoftDelete"] = true;
    const result = await User.get();
    expect(result?.length).toBe(2);
    expect(result).toEqual(expect.any(Array));
    expect(result?.[0]).toEqual(expect.any(Object));
  });

  it("should return all users with only the 'name' field", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.get("name");

    expect(result?.length).toBe(3);
    expect(result).toEqual(expect.any(Array));
    expect(result?.[0]).toEqual(expect.any(Object));
    expect(result?.[0]).toHaveProperty("name");
    expect(result?.[0]).not.toHaveProperty("age");
    expect(result?.[0]).not.toHaveProperty("email");
  });

  it("should return all users with 'name' and 'age' fields", async () => {
    User["$useSoftDelete"] = false;
    const result = await User.get(["name", "age"]);

    expect(result?.length).toBe(3);
    expect(result).toEqual(expect.any(Array));
    expect(result?.[0]).toEqual(expect.any(Object));
    expect(result?.[0]).toHaveProperty("name");
    expect(result?.[0]).toHaveProperty("age");
    expect(result?.[0]).not.toHaveProperty("email");
  });
});
