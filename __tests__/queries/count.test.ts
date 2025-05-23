import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

// Define a User model extending the base Model
interface IUser extends IMongoloquentSchema {
  name: string;
  email: string;
  age: number;
}
class User extends Model<IUser> {
  static $schema: IUser;
  protected $collection: string = "users";
}

class UserD extends Model<IUser> {
  static $schema: IUser;
  protected $collection: string = "users";
  protected $useSoftDelete: boolean = true;
}

const query = User["query"]();
const userCollection = query["getCollection"]();

// Sample user data for testing
const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    [query.getIsDeleted()]: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    [query.getIsDeleted()]: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    [query.getIsDeleted()]: true,
    age: 50,
  },
];

// Clear the user collection before all tests
beforeAll(async () => {
  try {
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

// Clear the user collection after all tests
afterAll(async () => {
  try {
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("User Model - count method", () => {
  // Insert sample users before each test suite
  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  // Clear the user collection after each test suite
  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  // Test case: should return count of all users excluding soft deleted users
  it("should return count of all users excluding soft deleted users", async () => {
    const result = await User.count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(3);
  });

  // Test case: should return count of all users including soft deleted users
  it("should return count of all users including soft deleted users", async () => {
    const result = await UserD.count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(2);
  });

  // Test case: should return count of users with a specific name
  it("should return count of users named 'Udin'", async () => {
    const result = await User.where("name", "Udin").count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(1);
  });

  // Test case: should return 0 for non-existent user data
  it("should return 0 for non-existent user data", async () => {
    const result = await User.where("name", "Udin1").count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});
