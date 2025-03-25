import Model from "../../src/Model";

class User extends Model {}

const query = User["query"]();
const userCollection = query["getCollection"]();

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

describe("User Model - delete method", () => {
  beforeEach(async () => {
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

  it("should delete a user without soft delete", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").delete();
    const user = await User.where("name", "Udin").first();

    // Check if the user was deleted successfully
    expect(result).toEqual(1);
    expect(user).toEqual(null);
  });

  it("should soft delete a user", async () => {
    User["$useSoftDelete"] = true;
    User["$useTimestamps"] = false;

    await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").delete();
    const user = await User.where("name", "Udin").withTrashed().first();

    // Check if the user was soft deleted successfully
    expect(result).toEqual(1);
    expect(user).not.toEqual(null);
  });

  it("should return null when trying to delete a non-existent user", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const result = await User.where("name", "Udin").delete();

    // Check if the result is null for non-existent user
    expect(result).toEqual(0);
  });
});
