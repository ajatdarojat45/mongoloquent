import Model from "../../src/Model";

class User extends Model {}

const query = User["query"]();
const userCollection = query["getCollection"]();

beforeAll(async () => {
  try {
    await userCollection.deleteMany({});
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

describe("Model - update method", () => {
  beforeAll(async () => {
    try {
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

  it("should update data", async () => {
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

  it("should update data with timestamps", async () => {
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
    expect(result).toHaveProperty("createdAt", (user as any).createdAt);
    expect(result).toHaveProperty("updatedAt");
    // expect((result as any).updatedAt).not.toEqual((user as any).updatedAt);
  });

  it("with send _id in payload", async () => {
    User["$useSoftDelete"] = false;
    User["$useSoftDelete"] = false;

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

  it("with send createdAt at in payload", async () => {
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
    expect(result).toHaveProperty("createdAt", (user as any).createdAt);
  });

  it("with not found data", async () => {
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
