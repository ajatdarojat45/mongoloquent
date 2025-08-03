import { DB } from "../../src";

beforeEach(async () => {
	await DB.collection("users").getMongoDBCollection().deleteMany({});
	await DB.collection("posts").getMongoDBCollection().deleteMany({});
});

afterEach(async () => {
	await DB.collection("users").getMongoDBCollection().deleteMany({});
	await DB.collection("posts").getMongoDBCollection().deleteMany({});
});

describe("lookup", () => {
	it("should create a lookup stage", async () => {
		const userIds = await DB.collection("users").insertMany([
			{ name: "John Doe" },
			{ name: "Jane Doe" },
		]);

		const postIds = await DB.collection("posts").insertMany([
			{ title: "Post 1", userId: userIds[0] },
			{ title: "Post 2", userId: userIds[1] },
		]);

		const users = await DB.collection<any>("users")
			.lookup({
				from: "posts",
				localField: "_id",
				foreignField: "userId",
				as: "posts",
			})
			.get();

		expect(users).toHaveLength(2);
		expect(users[0].posts).toHaveLength(1);
	});
});
