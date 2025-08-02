import {
	IMongoloquentSchema,
	IMongoloquentSoftDelete,
	IMongoloquentTimestamps,
	Model,
	DB,
	MongoloquentNotFoundException,
} from "../../src/";

interface IUser extends IMongoloquentSchema {
	name: string;
	email: string;
	age: number;
}
class User extends Model<IUser> {
	static $schema: IUser;
}

class UserD extends Model<IUser> {
	protected $useSoftDelete = true;
	protected $collection: string = "users";
}

const query = User["query"]();
const userCollection = query.getMongoDBCollection();

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

describe("User Model - sum method", () => {
	beforeAll(async () => {
		try {
			await userCollection.insertMany(users);
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

	it("should return the sum of ages without soft delete", async () => {
		const result = await User.sum("age");

		expect(result).toEqual(expect.any(Number));
		expect(result).toBe(80);
	});

	it("should return the sum of ages with soft delete enabled", async () => {
		const result = await UserD.sum("age");

		expect(result).toEqual(expect.any(Number));
		expect(result).toBe(30);
	});

	it("should return the sum of ages with a where condition", async () => {
		const result = await User.where("name", "Udin").sum("age");

		expect(result).toEqual(expect.any(Number));
		expect(result).toBe(10);
	});

	it("should return 0 when no matching data is found", async () => {
		const result = await User.where("name", "Udin1").sum("age");

		expect(result).toEqual(expect.any(Number));
		expect(result).toEqual(0);
	});

	it("should return 0 when summing a non-numeric field", async () => {
		const result = await User.sum("name");

		expect(result).toEqual(expect.any(Number));
		expect(result).toEqual(0);
	});
});
