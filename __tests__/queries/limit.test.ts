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
	balance: number;
}
class User extends Model<IUser> {
	static $schema: IUser;
}

class UserD extends Model<IUser> {
	static $schema: IUser;
	protected $useSoftDelete = true;
	protected $collection: string = "users";
}

const query = User["query"]();
const userCollection = query.getMongoDBCollection();

beforeAll(async () => {
	await userCollection?.deleteMany({});

	await userCollection?.insertMany([
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
});

afterAll(async () => {
	await userCollection?.deleteMany({});
});

describe("Model - limit() method", () => {
	it("should limit result to 2 records without any conditions", async () => {
		const result = await User.limit(2).get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should limit result to 1 record with AND conditions", async () => {
		const result = await User.where("age", 5)
			.where(query.getIsDeleted() as keyof IUser, false)
			.limit(1)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should limit result to 2 records with OR conditions", async () => {
		const result = await User.where("balance", 500)
			.orWhere("age", 30)
			.limit(2)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should limit result to 2 records with mixed AND & OR conditions", async () => {
		const result = await User.where("age", 5)
			.orWhere("balance", 500)
			.limit(2)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should limit result to 2 records with whereBetween condition", async () => {
		const result = await User.whereBetween("age", [5, 10]).limit(2).get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should limit result to 2 records with soft delete enabled", async () => {
		const result = await UserD.limit(2).get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should limit result to 1 record with soft delete and AND conditions", async () => {
		const result = await UserD.where("age", 5)
			.where(query.getIsDeleted() as keyof IUser, false)
			.limit(1)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should limit result to 1 record with soft delete and OR conditions", async () => {
		const result = await UserD.where("balance", 500)
			.orWhere("age", 30)
			.limit(1)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should limit result to 1 record with soft delete and mixed AND & OR conditions", async () => {
		const result = await UserD.where("age", 5)
			.orWhere("balance", 500)
			.limit(1)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should limit result to 2 records with soft delete and whereBetween", async () => {
		const result = await UserD.whereBetween("age", [5, 10]).limit(2).get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should limit result to 2 records with withTrashed option", async () => {
		const result = await UserD.limit(2).withTrashed().get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should limit result to 1 record with withTrashed and AND conditions", async () => {
		const result = await UserD.where("age", 45)
			.where("balance", 500)
			.withTrashed()
			.limit(2)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should limit result to 1 record with withTrashed and OR conditions", async () => {
		const result = await UserD.where("age", 45)
			.orWhere("balance", 500)
			.withTrashed()
			.limit(1)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should limit result to 1 record with onlyTrashed option", async () => {
		const result = await UserD.limit(2).onlyTrashed().get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should limit result to 1 record with onlyTrashed and AND conditions", async () => {
		const result = await UserD.where("age", 45)
			.where("balance", 500)
			.onlyTrashed()
			.limit(2)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should limit result to 1 record with onlyTrashed and OR conditions", async () => {
		const result = await UserD.where("age", 45)
			.orWhere("balance", 500)
			.onlyTrashed()
			.limit(1)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});
});
