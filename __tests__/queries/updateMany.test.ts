import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IUser extends IMongoloquentSchema {
  name: string;
  age: number;
  address: string;
}

class User extends Model<IUser> {}

const query = User["query"]();
const userCollection = query["getCollection"]();

beforeAll(async () => {
  try {
    await userCollection.deleteMany({});
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

describe("User Model - Update Method", () => {
  it("should update user data without timestamps", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").updateMany({
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });
    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(1);

    const user = await User.where("name", "Udin Ganteng").first();
    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("name", "Udin Ganteng");
    expect(user).toHaveProperty("age", 21);
    expect(user).toHaveProperty("address", "Jakarta");
    expect(user).toHaveProperty("_id");
  });

  it("should update user data with timestamps", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = true;

    const user = await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").updateMany({
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });
    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(1);

    const updatedUser = await User.where("name", "Udin Ganteng").first();
    expect(updatedUser).toEqual(expect.any(Object));
    expect(updatedUser).toHaveProperty("name", "Udin Ganteng");
    expect(updatedUser).toHaveProperty("age", 21);
    expect(updatedUser).toHaveProperty("address", "Jakarta");
    expect(updatedUser).toHaveProperty("_id");
    expect(updatedUser).toHaveProperty(
      query["$createdAt"],
      (user as any)[query["$createdAt"]],
    );
    expect(updatedUser).toHaveProperty(query["$updatedAt"]);
  });

  it("should update user data including _id in payload", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const user = await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").updateMany({
      _id: (user as any)._id,
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });
    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(1);

    const updatedUser = await User.where("name", "Udin Ganteng").first();
    expect(updatedUser).toEqual(expect.any(Object));
    expect(updatedUser).toHaveProperty("name", "Udin Ganteng");
    expect(updatedUser).toHaveProperty("age", 21);
    expect(updatedUser).toHaveProperty("address", "Jakarta");
    expect(updatedUser).toHaveProperty("_id", (user as any)._id);
  });

  it("should update user data including createdAt in payload", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = true;

    const user = await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").updateMany({
      createdAt: (user as any).createdAt,
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });
    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(1);

    const updatedUser = await User.where("name", "Udin Ganteng").first();
    expect(updatedUser).toEqual(expect.any(Object));
    expect(updatedUser).toHaveProperty("name", "Udin Ganteng");
    expect(updatedUser).toHaveProperty("age", 21);
    expect(updatedUser).toHaveProperty("address", "Jakarta");
    expect(updatedUser).toHaveProperty("_id", (user as any)._id);
    expect(updatedUser).toHaveProperty(
      query["$createdAt"],
      (user as any)[query["$createdAt"]],
    );
  });

  it("should return null when no matching data is found", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const result = await User.where("name", "Udin").updateMany({
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});
