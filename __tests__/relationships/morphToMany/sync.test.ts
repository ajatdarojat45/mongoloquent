import {
	IMongoloquentSchema,
	IMongoloquentSoftDelete,
	IMongoloquentTimestamps,
	Model,
	DB,
	MongoloquentNotFoundException,
} from "../../../src/";

beforeEach(async () => {
	await DB.collection("posts").getMongoDBCollection().deleteMany({});
	await DB.collection("tags").getMongoDBCollection().deleteMany({});
	await DB.collection("taggables").getMongoDBCollection().deleteMany({});
});

afterEach(async () => {
	await DB.collection("posts").getMongoDBCollection().deleteMany({});
	await DB.collection("tags").getMongoDBCollection().deleteMany({});
	await DB.collection("taggables").getMongoDBCollection().deleteMany({});
});

describe("sync method", () => {
	interface IPost extends IMongoloquentSchema {
		name: string;
		tags?: ITag[];
	}

	interface ITag extends IMongoloquentSchema {
		name: string;
		active: boolean;
	}

	class Post extends Model<IPost> {
		protected $collection = "posts";
		static $schema: IPost;

		tags() {
			return this.morphToMany(Tag, "taggable");
		}
	}

	class Tag extends Model<ITag> {
		protected $collection = "tags";
		static $schema: ITag;
	}

	it("without values", async () => {
		const postIds = await Post.insertMany([
			{ name: "Post 1" },
			{ name: "Post 2" },
			{ name: "Post 3" },
		]);

		const tagIds = await Tag.insertMany([
			{ name: "Tag 1", active: true },
			{ name: "Tag 2", active: true },
			{ name: "Tag 3", active: true },
		]);

		const post = await Post.find(postIds[0]);
		await post.tags().attach(tagIds);

		const postTags = await post.tags().get();
		expect(postTags.length).toBe(3);

		await post.tags().sync([tagIds[0], tagIds[1]]);
		const postTagsAfterSync = await post.tags().get();
		expect(postTagsAfterSync.length).toBe(2);
	});

	it("with values", async () => {
		const postIds = await Post.insertMany([
			{ name: "Post 1" },
			{ name: "Post 2" },
			{ name: "Post 3" },
		]);

		const tagIds = await Tag.insertMany([
			{ name: "Tag 1", active: true },
			{ name: "Tag 2", active: true },
			{ name: "Tag 3", active: true },
		]);

		const post = await Post.find(postIds[0]);
		await post.tags().attach(tagIds[0]);

		const postTags = await post.tags().get();
		expect(postTags.length).toBe(1);

		await post.tags().sync<{ additional: string }>([tagIds[0], tagIds[1]], {
			additional: "test",
		});
		const postTagsAfterSync = await post.tags().get();
		expect(postTagsAfterSync.length).toBe(2);

		const taggables = await DB.collection("taggables").get();
		expect(taggables.length).toBe(2);
		expect(taggables[0]).not.toHaveProperty("additional");
		expect(taggables[1]).toHaveProperty("additional");
	});
});
