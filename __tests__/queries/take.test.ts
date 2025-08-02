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

describe("Take Query Builder - Limit Results", () => {
	it("should return first N records when take method is used", async () => {
		const result = await User.take(2).get();

		expect(result).toEqual(expect.any(Array));
		expect(result).toHaveLength(2);
	});
});
