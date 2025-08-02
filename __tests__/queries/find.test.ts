import {
	IMongoloquentSchema,
	IMongoloquentSoftDelete,
	IMongoloquentTimestamps,
	Model,
	DB,
} from "../../src/";

interface IUser extends IMongoloquentSchema {
	name: string;
	email: string;
	age: number;
	balance: number;
}
class User extends Model<IUser> {
	static $schema: IUser;
	protected $useSoftDelete = true;
	protected $collection: string = "users";
}

const query = User["query"]();
const userCollection = query.getMongoDBCollection();
let userIds: any = [];

beforeAll(async () => {
	await userCollection?.deleteMany({});

	const insertedUsers = await userCollection?.insertMany([
		{
			name: "John",
			email: "john@mail.com",
			age: 10,
			balance: 100,
			[query.getIsDeleted()]: false,
		},
		{
			name: "doe",
			email: "doe@mail.com",
			age: 30,
			balance: 200,
			[query.getIsDeleted()]: false,
		},
		{
			name: "Udin",
			email: "udin@mail.com",
			age: 5,
			balance: 500,
			[query.getIsDeleted()]: false,
		},
		{
			name: "Kosasih",
			email: "kosasih@mail.com",
			age: 5,
			balance: 400,
			[query.getIsDeleted()]: false,
		},
		{
			name: "Joko",
			email: "joko@mail.com",
			age: 45,
			balance: 500,
			[query.getIsDeleted()]: true,
		},
	]);
	userIds = insertedUsers?.insertedIds;
});

afterAll(async () => {
	await userCollection?.deleteMany({});
});

describe("Find Method Tests", () => {
	it("should find and return a single document using first() method", async () => {
		const result = await User?.find(userIds["0"]);
		expect(result).toEqual(expect.any(Object));
		expect(result).toHaveProperty("name", "John");
		expect(result).toHaveProperty("email", "john@mail.com");
		expect(result).toHaveProperty("age", 10);
		expect(result).toHaveProperty("balance", 100);
	});

	it("should find and return an array with one document using get() method", async () => {
		const result = await User.find(userIds["0"]);
		expect(result).toHaveProperty("name", "John");
		expect(result).toHaveProperty("email", "john@mail.com");
		expect(result).toHaveProperty("age", 10);
		expect(result).toHaveProperty("balance", 100);
	});

	it("should return null when finding soft deleted document using first() method", async () => {
		const user = await User.find(userIds["4"]);
		expect(user).toBeNull();
	});
});
