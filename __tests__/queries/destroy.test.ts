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

describe("Model - destroy method", () => {
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

  // Test case for deleting a single user by string ID
  it("should delete a single user when given a string ID", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const userIds = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.destroy(userIds[0].toString());
    const users = await User.all();

    expect(result).toEqual(1);
    expect(users?.length).toEqual(1);
  });

  // Test case for deleting multiple users by an array of string IDs
  it("should delete multiple users when given an array of string IDs", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const userIds = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const ids = userIds.map((el) => el.toString());

    const result = await User.destroy(ids);
    const users = await User.all();

    expect(result).toEqual(2);
    expect(users?.length).toEqual(0);
  });

  // Test case for deleting a single user by ObjectId
  it("should delete a single user when given an ObjectId", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const userIds = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.destroy(userIds[0]);
    const users = await User.all();

    expect(result).toEqual(1);
    expect(users?.length).toEqual(1);
  });

  // Test case for deleting multiple users by an array of ObjectIds
  it("should delete multiple users when given an array of ObjectIds", async () => {
    User["$useSoftDelete"] = false;
    User["$useTimestamps"] = false;

    const userIds = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.destroy(userIds);
    const users = await User.all();

    expect(result).toEqual(2);
    expect(users?.length).toEqual(0);
  });
});
