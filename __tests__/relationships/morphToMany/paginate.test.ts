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

describe("get method", () => {
	describe("without soft delete", () => {
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

		it("without params", async () => {
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

			const post2 = await Post.find(postIds[1]);
			await post2.tags().attach(tagIds[2]);

			const tag = await post.tags().paginate();
			expect(tag).toEqual(expect.any(Object));
			expect(tag).toHaveProperty("data");
			expect(tag).toHaveProperty("meta");
			expect(tag.data.length).toBe(2);
			expect(tag.meta).toEqual(expect.any(Object));
			expect(tag.meta).toHaveProperty("total", 2);
			expect(tag.meta).toHaveProperty("page", 1);
			expect(tag.meta).toHaveProperty("limit", 15);
			expect(tag.meta).toHaveProperty("lastPage", 1);
		});

		it("with params", async () => {
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

			const post2 = await Post.find(postIds[1]);
			await post2.tags().attach(tagIds[2]);

			const tag = await post.tags().paginate(2, 1);
			expect(tag).toEqual(expect.any(Object));
			expect(tag).toHaveProperty("data");
			expect(tag).toHaveProperty("meta");
			expect(tag.data.length).toBe(1);
			expect(tag.meta).toEqual(expect.any(Object));
			expect(tag.meta).toHaveProperty("total", 2);
			expect(tag.meta).toHaveProperty("page", 2);
			expect(tag.meta).toHaveProperty("limit", 1);
			expect(tag.meta).toHaveProperty("lastPage", 2);
		});
	});

	describe("with soft delete", () => {
		interface IPost extends IMongoloquentSchema {
			name: string;
			tags?: ITag[];
		}

		interface ITag extends IMongoloquentSchema, IMongoloquentSoftDelete {
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
			protected $useSoftDelete: boolean = true;
		}

		it("without param", async () => {
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
			await post.tags().attach(tagIds);

			const post2 = await Post.find(postIds[1]);
			await post2.tags().attach(tagIds[2]);

			await Tag.destroy(tagIds[0]);

			const tag = await post.tags().paginate();
			expect(tag).toEqual(expect.any(Object));
			expect(tag).toHaveProperty("data");
			expect(tag).toHaveProperty("meta");
			expect(tag.data.length).toBe(2);
			expect(tag.meta).toEqual(expect.any(Object));
			expect(tag.meta).toHaveProperty("total", 2);
			expect(tag.meta).toHaveProperty("page", 1);
			expect(tag.meta).toHaveProperty("limit", 15);
			expect(tag.meta).toHaveProperty("lastPage", 1);

			const tags2 = await Tag.withTrashed().get();
			expect(tags2.length).toBe(3);
		});

		it("with param", async () => {
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
			await post.tags().attach(tagIds);

			const post2 = await Post.find(postIds[1]);
			await post2.tags().attach(tagIds[2]);

			await Tag.destroy(tagIds[0]);

			const tag = await post.tags().paginate(2, 1);
			expect(tag).toEqual(expect.any(Object));
			expect(tag).toHaveProperty("data");
			expect(tag).toHaveProperty("meta");
			expect(tag.data.length).toBe(1);
			expect(tag.meta).toEqual(expect.any(Object));
			expect(tag.meta).toHaveProperty("total", 2);
			expect(tag.meta).toHaveProperty("page", 2);
			expect(tag.meta).toHaveProperty("limit", 1);
			expect(tag.meta).toHaveProperty("lastPage", 2);

			const tags2 = await Tag.withTrashed().all();
			expect(tags2.length).toBe(3);
		});
	});
});
