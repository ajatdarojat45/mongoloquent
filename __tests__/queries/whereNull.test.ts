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
	subscription: boolean | null;
}
class User extends Model<IUser> {}
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
			subscription: null,
		},
		{
			name: "doe",
			email: "doe@mail.com",
			age: 30,
			balance: 200,
			[query.getIsDeleted()]: false,
			subscription: null,
		},
		{
			name: "Udin",
			email: "udin@mail.com",
			age: 5,
			balance: 500,
			[query.getIsDeleted()]: false,
			subscription: null,
		},
		{
			name: "Kosasih",
			email: "kosasih@mail.com",
			age: 5,
			balance: 400,
			[query.getIsDeleted()]: false,
			subscription: true,
		},
		{
			name: "Joko",
			email: "joko@mail.com",
			age: 45,
			balance: 500,
			[query.getIsDeleted()]: true,
			subscription: true,
		},
	]);
});

afterAll(async () => {
	await userCollection?.deleteMany({});
});

describe("Model.whereNull() - Filtering null values", () => {
	it("should return records where specified field is null", async () => {
		const result = await User.whereNull("subscription").get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(3);
	});

	it("should combine whereNull with where clause using AND", async () => {
		const result = await User.where("balance", 500)
			.whereNull("subscription")
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should combine whereNull with orWhere clause", async () => {
		const result = await User.whereNull("subscription").orWhere("age", 5).get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(4);
	});

	it("should handle multiple where conditions with OR", async () => {
		const result = await User.where("balance", 500)
			.where("age", 5)
			.orWhere("name", "Kosasih")
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should respect soft delete when querying records", async () => {
		const result = await UserD.where("balance", 500).get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should combine soft delete with OR conditions", async () => {
		const result = await UserD.where("balance", 500)
			.orWhere("name", "Kosasih")
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should combine soft delete with AND conditions", async () => {
		const result = await UserD.where("balance", 500).where("age", 5).get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should include deleted records when using withTrashed", async () => {
		const result = await UserD.where("balance", 500).withTrashed().get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should combine withTrashed and OR conditions", async () => {
		const result = await UserD.where("balance", 500)
			.orWhere("name", "Kosasih")
			.withTrashed()
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(3);
	});

	it("should combine withTrashed and AND conditions", async () => {
		const result = await UserD.where("balance", 500)
			.where("age", 45)
			.withTrashed()
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should only return deleted records with onlyTrashed", async () => {
		const result = await UserD.onlyTrashed().get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should combine onlyTrashed with OR conditions", async () => {
		const result = await UserD.where("balance", 500)
			.orWhere("name", "Kosasih")
			.onlyTrashed()
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should combine onlyTrashed with AND conditions", async () => {
		const result = await UserD.where("balance", 500)
			.where("age", 100)
			.onlyTrashed()
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(0);
	});
});
