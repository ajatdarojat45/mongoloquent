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

describe("Model - update method", () => {
  const userCollection = User["getCollection"]();

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

    const latestUser = await User.where("_id", result?._id).first();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Udin Ganteng");
    expect(result).toHaveProperty("age", 21);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty(
      User["$createdAt"],
      (user as any)[User["$createdAt"]]
    );
    expect(result).toHaveProperty(User["$updatedAt"], (latestUser as any)[User["$updatedAt"]]);
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
