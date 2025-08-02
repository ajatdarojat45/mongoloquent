import { IMongoloquentSchema, Model } from "../../src";

interface IUser extends IMongoloquentSchema {
	name: string;
	email: string;
	age: number;
}

// Define User model extending from Model
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
const userCollection = query.getMongoDBCollection();

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
		await userCollection.deleteMany({});
	} catch (error) {
		console.error(error);
	}
});

// Clean up the collection after all tests
afterAll(async () => {
	try {
		await userCollection.deleteMany({});
	} catch (error) {
		console.error(error);
	}
});

describe("User Model - avg method", () => {
	// Insert sample data before each test in this describe block
	beforeAll(async () => {
		try {
			await userCollection.insertMany(users);
		} catch (error) {
			console.error(error);
		}
	});

	// Clean up the collection after each test in this describe block
	afterAll(async () => {
		try {
			await userCollection.deleteMany({});
		} catch (error) {
			console.error(error);
		}
	});

	// Test case: should return average age excluding soft deleted users
	it("should return average age excluding soft deleted users", async () => {
		const result = await User.avg("age");
		expect(result).toEqual(expect.any(Number));
		expect(Math.round(result)).toBe(27);
	});

	// Test case: should return average age including soft deleted users
	it("should return average age including soft deleted users", async () => {
		const result = await UserD.avg("age");

		expect(result).toEqual(expect.any(Number));
		expect(result).toBe(15);
	});

	// Test case: should return average age for users with a specific name
	it("should return average age for users named 'Udin'", async () => {
		const result = await User.where("name", "Udin").avg("age");

		expect(result).toEqual(expect.any(Number));
		expect(result).toBe(10);
	});

	// Test case: should return 0 for non-existent user data
	it("should return 0 for non-existent user data", async () => {
		const result = await User.where("name", "Udin1").avg("age");

		expect(result).toEqual(expect.any(Number));
		expect(result).toEqual(0);
	});

	// Test case: should return 0 for non-numeric field
	it("should return 0 for non-numeric field", async () => {
		const result = await User.avg("name");
		expect(result).toEqual(expect.any(Number));
		expect(result).toEqual(0);
	});
});
