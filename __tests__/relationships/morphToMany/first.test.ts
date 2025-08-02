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

describe("first method", () => {
	it("return data", async () => {
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

		const postIds = await Post.insertMany([
			{ name: "Post 1" },
			{ name: "Post 2" },
		]);

		const tagIds = await Tag.insertMany([
			{ name: "Tag 1", active: true },
			{ name: "Tag 2", active: false },
			{ name: "Tag 3", active: true },
		]);

		const post = await Post.find(postIds[0]);
		await post.tags().attach([tagIds[0], tagIds[1]]);

		const tag = await post.tags().where("name", "Tag 1").first();
		expect(tag).toEqual(expect.any(Object));
		expect(tag?.name).toBe("Tag 1");
		expect(tag?.active).toBe(true);
	});

	it("return null", async () => {
		interface IPost extends IMongoloquentSchema {
			name: string;
			tags?: ITag[];
		}

		interface ITag extends IMongoloquentSchema {
			name: string;
			active: boolean;
		}

		class Post extends Model<IPost> {
			static $collection = "posts";
			static $schema: IPost;

			tags() {
				return this.morphToMany(Tag, "taggable");
			}
		}

		class Tag extends Model<ITag> {
			static $collection = "tags";
			static $schema: ITag;
		}

		const postIds = await Post.insertMany([
			{ name: "Post 1" },
			{ name: "Post 2" },
		]);

		const tagIds = await Tag.insertMany([
			{ name: "Tag 1", active: true },
			{ name: "Tag 2", active: false },
			{ name: "Tag 3", active: true },
		]);

		const post = await Post.find(postIds[0]);
		await post.tags().attach([tagIds[0], tagIds[1]]);

		const tag = await post.tags().where("name", "Tag 3").first();
		expect(tag).toBeNull();
	});
});
