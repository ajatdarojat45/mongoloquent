import { ObjectId } from "mongodb";

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
	await DB.collection("comments").getMongoDBCollection().deleteMany({});
});

afterEach(async () => {
	await DB.collection("posts").getMongoDBCollection().deleteMany({});
	await DB.collection("comments").getMongoDBCollection().deleteMany({});
});

describe("get method", () => {
	describe("without parameters", () => {
		it("should return all doc", async () => {
			interface IPost extends IMongoloquentSchema {
				title: string;
				content: string;
				comments?: Comment[];
			}

			interface IComment extends IMongoloquentSoftDelete {
				postId: ObjectId;
				content: string;
				active: boolean;
			}

			class Post extends Model<IPost> {
				protected $collection = "posts";
				static $schema: Post;

				comments() {
					return this.hasMany(Comment, "postId", "_id");
				}
			}

			class Comment extends Model<IComment> {
				protected $collection = "comments";
				protected $useTimestamps = false;
				static $schema: Comment;
			}

			const postsIds = await Post.insertMany([
				{ title: "Post 1", content: "Content 1" },
				{ title: "Post 2", content: "Content 2" },
			]);

			await Comment.insertMany([
				{ postId: postsIds[0], content: "Comment 1", active: true },
				{ postId: postsIds[0], content: "Comment 2", active: true },
				{ postId: postsIds[1], content: "Comment 3", active: true },
			]);

			const post = await Post.find(postsIds[0]);

			const comments = await post.comments().get();
			expect(comments).toEqual(expect.any(Array));
			expect(comments).toHaveLength(2);
			expect(comments[0]).toEqual(expect.any(Object));
			expect(comments[0]).toHaveProperty("_id");
			expect(comments[0]).toHaveProperty("postId", post._id);
			expect(comments[0]).toHaveProperty("content", "Comment 1");
			expect(comments[0]).toHaveProperty("active", true);
		});
	});

	describe("with parameters", () => {
		it("with single parameter", async () => {
			interface IPost extends IMongoloquentSchema {
				title: string;
				content: string;
				comments?: Comment[];
			}

			interface IComment extends IMongoloquentSoftDelete {
				postId: ObjectId;
				content: string;
				active: boolean;
			}

			class Post extends Model<IPost> {
				protected $collection = "posts";
				static $schema: Post;

				comments() {
					return this.hasMany(Comment, "postId", "_id");
				}
			}

			class Comment extends Model<IComment> {
				protected $collection = "comments";
				protected $useTimestamps = false;
				static $schema: Comment;
			}

			const postsIds = await Post.insertMany([
				{ title: "Post 1", content: "Content 1" },
				{ title: "Post 2", content: "Content 2" },
			]);

			await Comment.insertMany([
				{ postId: postsIds[0], content: "Comment 1", active: true },
				{ postId: postsIds[0], content: "Comment 2", active: true },
				{ postId: postsIds[1], content: "Comment 3", active: true },
			]);

			const post = await Post.find(postsIds[0]);

			const comments = await post.comments().get("content");
			expect(comments).toEqual(expect.any(Array));
			expect(comments).toHaveLength(2);
			expect(comments[0]).toEqual(expect.any(Object));
			expect(comments[0]).toHaveProperty("_id");
			expect(comments[0]).toHaveProperty("content", "Comment 1");
			expect(comments[0]).not.toHaveProperty("postId", post._id);
			expect(comments[0]).not.toHaveProperty("active", true);
		});

		it("with multiple parameters", async () => {
			interface IPost extends IMongoloquentSchema {
				title: string;
				content: string;
				comments?: Comment[];
			}

			interface IComment extends IMongoloquentSoftDelete {
				postId: ObjectId;
				content: string;
				active: boolean;
			}

			class Post extends Model<IPost> {
				protected $collection = "posts";
				static $schema: Post;

				comments() {
					return this.hasMany(Comment, "postId", "_id");
				}
			}

			class Comment extends Model<IComment> {
				protected $collection = "comments";
				protected $useTimestamps = false;
				static $schema: Comment;
			}

			const postsIds = await Post.insertMany([
				{ title: "Post 1", content: "Content 1" },
				{ title: "Post 2", content: "Content 2" },
			]);

			await Comment.insertMany([
				{ postId: postsIds[0], content: "Comment 1", active: true },
				{ postId: postsIds[0], content: "Comment 2", active: true },
				{ postId: postsIds[1], content: "Comment 3", active: true },
			]);

			const post = await Post.find(postsIds[0]);

			const comments = await post.comments().get("content", "active");
			expect(comments).toEqual(expect.any(Array));
			expect(comments).toHaveLength(2);
			expect(comments[0]).toEqual(expect.any(Object));
			expect(comments[0]).toHaveProperty("_id");
			expect(comments[0]).toHaveProperty("content", "Comment 1");
			expect(comments[0]).toHaveProperty("active", true);
			expect(comments[0]).not.toHaveProperty("postId", post._id);
		});

		it("with array parameter", async () => {
			interface IPost extends IMongoloquentSchema {
				title: string;
				content: string;
				comments?: Comment[];
			}

			interface IComment extends IMongoloquentSoftDelete {
				postId: ObjectId;
				content: string;
				active: boolean;
			}

			class Post extends Model<IPost> {
				protected $collection = "posts";
				static $schema: Post;

				comments() {
					return this.hasMany(Comment, "postId", "_id");
				}
			}

			class Comment extends Model<IComment> {
				protected $collection = "comments";
				protected $useTimestamps = false;
				static $schema: Comment;
			}

			const postsIds = await Post.insertMany([
				{ title: "Post 1", content: "Content 1" },
				{ title: "Post 2", content: "Content 2" },
			]);

			await Comment.insertMany([
				{ postId: postsIds[0], content: "Comment 1", active: true },
				{ postId: postsIds[0], content: "Comment 2", active: true },
				{ postId: postsIds[1], content: "Comment 3", active: true },
			]);

			const post = await Post.find(postsIds[0]);

			const comments = await post.comments().get(["content", "active"]);
			expect(comments).toEqual(expect.any(Array));
			expect(comments).toHaveLength(2);
			expect(comments[0]).toEqual(expect.any(Object));
			expect(comments[0]).toHaveProperty("_id");
			expect(comments[0]).toHaveProperty("content", "Comment 1");
			expect(comments[0]).toHaveProperty("active", true);
			expect(comments[0]).not.toHaveProperty("postId", post._id);
		});
	});
});
