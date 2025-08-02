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

class User extends Model<IUser> {}

class UserD extends Model<IUser> {
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

describe("Query builder - orWhere Clause Tests", () => {
	it("should return records matching single condition with comparison operator", async () => {
		const result = await User.orWhere("balance", ">=", 500).get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should return records matching single equality condition", async () => {
		const result = await User.orWhere("balance", 500).get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should return records matching multiple orWhere conditions", async () => {
		const result = await User.orWhere("balance", 500)
			.orWhere("age", "<=", 10)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(4);
	});

	it("should combine where and orWhere conditions correctly", async () => {
		const result = await User.where("balance", 500)
			.orWhere("name", "Kosasih")
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(3);
	});

	it("should handle multiple where and orWhere conditions in sequence", async () => {
		const result = await User.where("balance", 500)
			.where("age", 5)
			.orWhere("name", "Kosasih")
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should respect soft delete when using orWhere", async () => {
		const result = await UserD.where("name", "Kosasih")
			.orWhere("balance", 500)
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should combine soft delete with orWhere conditions", async () => {
		const result = await UserD.where("balance", 500)
			.orWhere("name", "Kosasih")
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should apply soft delete with multiple where and orWhere conditions", async () => {
		const result = await UserD.where("balance", 500)
			.where("age", 45)
			.orWhere("name", "Kosasih")
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should include soft deleted records when using withTrashed", async () => {
		const result = await UserD.where("balance", 500).withTrashed().get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should combine withTrashed with where and orWhere conditions", async () => {
		const result = await UserD.where("balance", 500)
			.orWhere("name", "Kosasih")
			.withTrashed()
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(3);
	});

	it("should handle complex queries with withTrashed and multiple conditions", async () => {
		const result = await UserD.where("balance", 500)
			.where("age", 5)
			.orWhere("name", "Joko")
			.withTrashed()
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should return only soft deleted records with onlyTrashed", async () => {
		const result = await UserD.onlyTrashed().get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should filter soft deleted records with orWhere and onlyTrashed", async () => {
		const result = await UserD.where("balance", 500)
			.orWhere("name", "Kosasih")
			.onlyTrashed()
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should handle complex queries with onlyTrashed and multiple conditions", async () => {
		const result = await UserD.where("balance", 500)
			.where("age", 100)
			.orWhere("name", "Kosasih")
			.onlyTrashed()
			.get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(0);
	});
});
