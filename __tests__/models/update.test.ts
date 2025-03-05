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

afterAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - Update Method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      // Setup before all tests
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

  it("should update user data without timestamps", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").update({
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Udin Ganteng");
    expect(result).toHaveProperty("age", 21);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("_id");
  });

  it("should update user data with timestamps", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = true;

    const user = await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").update({
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Udin Ganteng");
    expect(result).toHaveProperty("age", 21);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty(
      User["$createdAt"],
      (user as any)[User["$createdAt"]]
    );
    expect(result).toHaveProperty(User["$updatedAt"]);
    expect((result as any).updatedAt).not.toEqual(
      (user as any)[User["$updatedAt"]]
    );
  });

  it("should update user data including _id in payload", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const user = await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").update({
      _id: (user as any)._id,
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Udin Ganteng");
    expect(result).toHaveProperty("age", 21);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("_id", (user as any)._id);
  });

  it("should update user data including createdAt in payload", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = true;

    const user = await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").update({
      createdAt: (user as any).createdAt,
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Udin Ganteng");
    expect(result).toHaveProperty("age", 21);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("_id", (user as any)._id);
    expect(result).toHaveProperty(
      User["$createdAt"],
      (user as any)[User["$createdAt"]]
    );
  });

  it("should return null when no matching data is found", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const result = await User.where("name", "Udin").update({
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });

    expect(result).toEqual(null);
  });
});
