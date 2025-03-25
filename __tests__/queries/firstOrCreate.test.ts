import { ObjectId } from "mongodb";
import Model from "../../src/Model";

class User extends Model {
  static $collection = "users";
  static $useSoftDelete = true;
  static $useTimestamps = true;
}

const query = User["query"]();
const userCollection = query["getCollection"]();

describe("Model.firstOrCreate", () => {
  let userIds: ObjectId[];

  beforeAll(async () => {
    userIds = await User.insertMany([
      {
        name: "John Doe",
        email: "john@example.com",
      },
      {
        name: "Jane Doe",
        email: "jane@example.com",
      },
    ]);
  });

  afterAll(async () => {
    await userCollection?.deleteMany({});
  });

  it("should return the existing document if it matches the condition", async () => {
    const user = await User.firstOrCreate({ email: "john@example.com" });
    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("name", "John Doe");
    expect(user).toHaveProperty("email", "john@example.com");
  });

  it("should create a new document if no matching document is found", async () => {
    const newUser = await User.firstOrCreate({
      name: "Alice",
      email: "alice@example.com",
    });
    expect(newUser).toEqual(expect.any(Object));
    expect(newUser).toHaveProperty("name", "Alice");
    expect(newUser).toHaveProperty("email", "alice@example.com");

    const userInDb = await userCollection?.findOne({
      email: "alice@example.com",
    });
    expect(userInDb).toEqual(expect.any(Object));
    expect(userInDb).toHaveProperty("name", "Alice");
    expect(userInDb).toHaveProperty("email", "alice@example.com");
  });

  it("should handle documents with soft delete enabled", async () => {
    await User.destroy(userIds[0]);

    const user: any = await User.firstOrCreate({ email: "john@example.com" });
    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("email", "john@example.com");
    expect(user).toHaveProperty(query.getIsDeleted(), false);
    expect(user._id).not.toEqual(userIds[0]);
  });
});
