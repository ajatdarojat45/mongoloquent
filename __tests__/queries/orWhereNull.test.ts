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
	subscription?: boolean | null;
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

describe("QueryResult - orWhereNull method", () => {
	it("should return records with null subscription", async () => {
		const result = await User.orWhereNotNull("subscription").get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should combine where condition with orWhereNull", async () => {
		const result = await User.where("balance", 500)
			.orWhereNotNull("subscription")
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(3);
	});

	it("should combine multiple or conditions with orWhereNull", async () => {
		const result = await User.orWhereNotNull("subscription")
			.orWhere("age", 5)
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(3);
	});

	it("should combine where and or conditions with orWhereNull", async () => {
		const result = await User.where("balance", 500)
			.where("age", 5)
			.orWhereNotNull("subscription")
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(3);
	});

	it("should handle soft delete with orWhereNull", async () => {
		const result = await UserD.where("balance", 500)
			.orWhereNotNull("subscription")
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should combine soft delete and or conditions with orWhereNull", async () => {
		const result = await UserD.where("balance", 500)
			.orWhereNotNull("subscription")
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should combine soft delete and and conditions with orWhereNull", async () => {
		const result = await UserD.where("balance", 500)
			.where("age", 5)
			.orWhereNotNull("subscription")
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should include trashed records with orWhereNull when using withTrashed", async () => {
		const result = await UserD.where("balance", 500)
			.orWhereNotNull("subscription")
			.withTrashed()
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(3);
	});

	it("should combine withTrashed and or conditions with orWhereNull", async () => {
		const result = await UserD.where("balance", 500)
			.orWhereNotNull("subscription")
			.withTrashed()
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(3);
	});

	it("should combine withTrashed and and conditions with orWhereNull", async () => {
		const result = await UserD.where("balance", 500)
			.where("age", 45)
			.orWhereNotNull("subscription")
			.withTrashed()
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});

	it("should return only trashed records with orWhereNull when using onlyTrashed", async () => {
		const result = await UserD.onlyTrashed()
			.orWhereNotNull("subscription")
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should combine onlyTrashed and or conditions with orWhereNull", async () => {
		const result = await UserD.where("balance", 500)
			.orWhereNotNull("subscription")
			.onlyTrashed()
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});

	it("should combine onlyTrashed and and conditions with orWhereNull", async () => {
		const result = await UserD.where("balance", 500)
			.where("age", 100)
			.orWhereNotNull("subscription")
			.onlyTrashed()
			.get();
		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(1);
	});
});
