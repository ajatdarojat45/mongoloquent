import Model from "../../src/Model";

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

afterEach(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - updateOrCreate Method", () => {
  it("should create a new user if it does not exist", async () => {
    const userData = {
      name: "John Doe",
      age: 30,
      address: "New York",
    };

    const result = await User.updateOrCreate(userData, userData);
    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "John Doe");
    expect(result).toHaveProperty("age", 30);
    expect(result).toHaveProperty("address", "New York");
  });

  it("should update an existing user if it exists", async () => {
    const userData = {
      name: "Jane Doe",
      age: 25,
      address: "Los Angeles",
    };

    const createdUser: any = await User.insert(userData);

    const updatedData = {
      name: "Jane Doe",
      age: 26,
      address: "San Francisco",
    };

    const result = await User.updateOrCreate(userData, updatedData);
    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(1);

    const updated = await User.where("name", "Jane Doe").first();
    expect(updated).toEqual(expect.any(Object));
    expect(updated).toHaveProperty("_id", createdUser._id);
    expect(updated).toHaveProperty("name", "Jane Doe");
    expect(updated).toHaveProperty("age", 26);
    expect(updated).toHaveProperty("address", "San Francisco");
  });

  it("should create a new user if no matching data is found", async () => {
    const userData = {
      name: "Alice",
      age: 28,
      address: "Chicago",
    };

    const result = await User.updateOrCreate({ name: "Alice" }, userData);
    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Alice");
    expect(result).toHaveProperty("age", 28);
    expect(result).toHaveProperty("address", "Chicago");
  });

  it("should update an existing user including _id in payload", async () => {
    const userData = {
      name: "Bob",
      age: 35,
      address: "Houston",
    };

    const createdUser: any = await User.insert(userData);

    const updatedData = {
      _id: createdUser._id,
      name: "Bob",
      age: 36,
      address: "Dallas",
    };

    const result = await User.updateOrCreate({ name: "Bob" }, updatedData);
    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(1);

    const updated = await User.where("name", "Bob").first();
    expect(updated).toEqual(expect.any(Object));
    expect(updated).toHaveProperty("_id", createdUser._id);
    expect(updated).toHaveProperty("name", "Bob");
    expect(updated).toHaveProperty("age", 36);
    expect(updated).toHaveProperty("address", "Dallas");
  });

  it("should handle timestamps correctly when creating a new user", async () => {
    User["$useTimestamps"] = true;

    const userData = {
      name: "Charlie",
      age: 40,
      address: "Miami",
    };

    const result = await User.updateOrCreate({ name: "Charlie" }, userData);
    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Charlie");
    expect(result).toHaveProperty("age", 40);
    expect(result).toHaveProperty("address", "Miami");
    expect(result).toHaveProperty(User["$createdAt"]);
    expect(result).toHaveProperty(User["$updatedAt"]);
  });

  it("should handle timestamps correctly when updating an existing user", async () => {
    User["$useTimestamps"] = true;

    const userData = {
      name: "David",
      age: 45,
      address: "Seattle",
    };

    const createdUser: any = await User.insert(userData);

    const updatedData = {
      name: "David",
      age: 46,
      address: "Portland",
    };

    const result = await User.updateOrCreate({ name: "David" }, updatedData);
    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(1);

    const updated = await User.where("name", "David").first();
    expect(updated).toEqual(expect.any(Object));
    expect(updated).toHaveProperty("_id", createdUser._id);
    expect(updated).toHaveProperty("name", "David");
    expect(updated).toHaveProperty("age", 46);
    expect(updated).toHaveProperty("address", "Portland");
    expect(updated).toHaveProperty(
      User["$createdAt"],
      createdUser[User["$createdAt"]]
    );
    expect(updated).toHaveProperty(User["$updatedAt"]);
  });
});
