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

describe("count method", () => {
	describe("without soft delete", () => {
		interface IPost extends IMongoloquentSchema {
			name: string;
			tags?: ITag[];
		}

		interface ITag extends IMongoloquentSchema {
			name: string;
			active: boolean;
			likes: number;
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

		it("return count of tags", async () => {
			const postIds = await Post.insertMany([
				{ name: "Post 1" },
				{ name: "Post 2" },
			]);

			const tagIds = await Tag.insertMany([
				{ name: "Tag 1", active: true, likes: 0 },
				{ name: "Tag 2", active: false, likes: 0 },
				{ name: "Tag 3", active: true, likes: 0 },
			]);

			const post = await Post.find(postIds[0]);
			await post.tags().attach([tagIds[0], tagIds[1]]);

			const post2 = await Post.find(postIds[1]);
			await post2.tags().attach([tagIds[0], tagIds[1]]);

			const count = await post.tags().count();
			expect(count).toBe(2);
		});
	});

	describe("with soft delete", () => {
		interface IPost extends IMongoloquentSchema, IMongoloquentSoftDelete {
			name: string;
			tags?: ITag[];
		}

		interface ITag extends IMongoloquentSchema, IMongoloquentSoftDelete {
			name: string;
			active: boolean;
			likes: number;
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

		it("return count of tags", async () => {
			const postIds = await Post.insertMany([
				{ name: "Post 1" },
				{ name: "Post 2" },
			]);

			const tagIds = await Tag.insertMany([
				{ name: "Tag 1", active: true, likes: 0 },
				{ name: "Tag 2", active: false, likes: 0 },
				{ name: "Tag 3", active: true, likes: 0 },
			]);

			await Tag.destroy(tagIds[0]);
			const post = await Post.find(postIds[0]);
			await post.tags().attach([tagIds[0], tagIds[1]]);
			const post2 = await Post.find(postIds[1]);
			await post2.tags().attach([tagIds[0], tagIds[1]]);
			const count = await post.tags().count();
			expect(count).toBe(1);

			const tags = await Tag.withTrashed().get();
			expect(tags.length).toBe(3);
		});
	});
});
