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

describe("min method", () => {
	describe("without soft delete", () => {
		interface IPost extends IMongoloquentSchema {
			name: string;
			likes: number;
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

			posts() {
				return this.morphedByMany(Post, "taggable");
			}
		}

		it("return sum of tags", async () => {
			const postIds = await Post.insertMany([
				{ name: "Post 1", likes: 5 },
				{ name: "Post 2", likes: 10 },
			]);

			const tagIds = await Tag.insertMany([
				{ name: "Tag 1", active: true, likes: 5 },
				{ name: "Tag 2", active: false, likes: 10 },
				{ name: "Tag 3", active: true, likes: 20 },
			]);

			const post = await Post.find(postIds[0]);
			await post.tags().attach([tagIds[0], tagIds[1]]);

			const post2 = await Post.find(postIds[1]);
			await post2.tags().attach([tagIds[0], tagIds[1]]);

			const tag = await Tag.find(tagIds[0]);
			const sum = await tag.posts().min("likes");
			expect(sum).toBe(5);
		});
	});

	describe("with soft delete", () => {
		interface IPost extends IMongoloquentSchema, IMongoloquentSoftDelete {
			name: string;
			likes: number;
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
			protected $useSoftDelete: boolean = true;

			tags() {
				return this.morphToMany(Tag, "taggable");
			}
		}

		class Tag extends Model<ITag> {
			protected $collection = "tags";
			static $schema: ITag;
			protected $useSoftDelete: boolean = true;

			posts() {
				return this.morphedByMany(Post, "taggable");
			}
		}

		it("return sum of tags", async () => {
			const postIds = await Post.insertMany([
				{ name: "Post 1", likes: 5 },
				{ name: "Post 2", likes: 10 },
			]);

			const tagIds = await Tag.insertMany([
				{ name: "Tag 1", active: true, likes: 5 },
				{ name: "Tag 2", active: false, likes: 10 },
				{ name: "Tag 3", active: true, likes: 20 },
			]);

			const post = await Post.find(postIds[0]);
			await post.tags().attach([tagIds[0], tagIds[1]]);

			const post2 = await Post.find(postIds[1]);
			await post2.tags().attach([tagIds[0], tagIds[1]]);

			await Post.destroy(postIds[0]);

			const tag = await Tag.find(tagIds[0]);
			const sum = await tag.posts().min("likes");
			expect(sum).toBe(10);

			const sum2 = await tag.posts().withTrashed().min("likes");
			expect(sum2).toBe(5);
		});
	});
});
