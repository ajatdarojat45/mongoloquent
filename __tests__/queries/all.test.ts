import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

// Define User model extending from Model
interface IUser extends IMongoloquentSchema {
  name: string;
  email: string;
  age: number;
}
class User extends Model<IUser> {
  static $schema: IUser;
  protected $collection: string = "users";
  protected $useSoftDelete: boolean = false;
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
    [query["$isDeleted"]]: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    [query["$isDeleted"]]: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    [query["$isDeleted"]]: true,
    age: 50,
  },
];

// Clean up the collection before all tests
beforeAll(async () => {
  try {
    await userCollection?.deleteMany({});
  } catch (error) {
    console.error("Error in beforeAll:", error);
  }
});

// Clean up the collection after all tests
afterAll(async () => {
  try {
    await userCollection?.deleteMany({});
  } catch (error) {
    console.error("Error in afterAll:", error);
  }
});

describe("User Model - all method", () => {
  // Insert sample data before each test in this describe block
  beforeAll(async () => {
    try {
      await userCollection?.insertMany(users);
    } catch (error) {
      console.error("Error in beforeAll (describe):", error);
    }
  });

  // Clean up the collection after each test in this describe block
  afterAll(async () => {
    try {
      await userCollection?.deleteMany({});
    } catch (error) {
      console.error("Error in afterAll (describe):", error);
    }
  });

  // Test case: should return all users excluding soft deleted users
  it("should return all users excluding soft deleted users", async () => {
    const result = await User.all();
    expect(result?.length).toBe(3);
    expect(result).toEqual(expect.any(Array));
    expect(result?.[0]).toEqual(expect.any(Object));
  });

  // Test case: should return all users including soft deleted users
  it("should return all users including soft deleted users", async () => {
    const result = await UserD.all();
    expect(result?.length).toBe(2);
    expect(result).toEqual(expect.any(Array));
    expect(result?.[0]).toEqual(expect.any(Object));
  });

  it("all method with condition", async () => {
    const result = await UserD.where("age", 20).all();
    expect(result?.length).toBe(1);
    expect(result).toEqual(expect.any(Array));
    expect(result?.[0]).toEqual(expect.any(Object));
  });
});
