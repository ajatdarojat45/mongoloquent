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

describe("firstOrCreate method", () => {
	interface IPost extends IMongoloquentSchema {
		title: string;
		content: string;
		comments?: Comment[];
	}

	interface IComment extends IMongoloquentSoftDelete {
		postId: ObjectId;
		content: string;
		active?: boolean;
	}

	class Post extends Model<IPost> {
		protected $collection = "posts";
		protected $useTimestamps = false;
		static $schema: Post;

		comments() {
			return this.morphMany(Comment, "commentable");
		}
	}

	class Comment extends Model<IComment> {
		protected $collection = "comments";
		protected $useTimestamps = false;
		static $schema: Comment;
	}

	it("should create a new doc", async () => {
		const postsIds = await Post.insertMany([
			{ title: "Post 1", content: "Content 1" },
			{ title: "Post 2", content: "Content 2" },
		]);

		let post = await Post.find(postsIds[0]);
		const comment = await await post
			.comments()
			.firstOrCreate({ content: "Comment 1" });

		expect(comment).toEqual(expect.any(Object));
		expect(comment).toHaveProperty("_id");
		expect(comment).toHaveProperty("content", "Comment 1");
		expect(comment).toHaveProperty("commentableType", Post.name);
		expect(comment).toHaveProperty("commentableId", post._id);

		post = await Post.find(postsIds[0]);
		const comments = await post.comments().get();
		expect(comments).toEqual(expect.any(Array));
		expect(comments.length).toBe(1);
	});

	it("should return exsiting doc", async () => {
		const postsIds = await Post.insertMany([
			{ title: "Post 1", content: "Content 1" },
			{ title: "Post 2", content: "Content 2" },
		]);

		let post = await Post.find(postsIds[0]);
		await Comment.insertMany([{ postId: post._id, content: "Comment 1" }]);

		const comment = await post.comments().firstOrCreate({
			content: "Comment 1",
		});

		expect(comment).toEqual(expect.any(Object));
		expect(comment).toHaveProperty("_id");
		expect(comment).toHaveProperty("content", "Comment 1");
		expect(comment).toHaveProperty("commentableType", Post.name);
		expect(comment).toHaveProperty("commentableId", post._id);

		post = await Post.find(postsIds[0]);
		const comments = await post.comments().get();
		expect(comments).toEqual(expect.any(Array));
		expect(comments.length).toBe(1);
	});

	it("should create a new doc with 2 params", async () => {
		const postsIds = await Post.insertMany([
			{ title: "Post 1", content: "Content 1" },
			{ title: "Post 2", content: "Content 2" },
		]);

		let post = await Post.find(postsIds[0]);
		const comment = await post
			.comments()
			.firstOrCreate({ content: "Comment 1" }, { active: true });

		expect(comment).toEqual(expect.any(Object));
		expect(comment).toHaveProperty("_id");
		expect(comment).toHaveProperty("content", "Comment 1");
		expect(comment).toHaveProperty("active", true);
		expect(comment).toHaveProperty("commentableType", Post.name);
		expect(comment).toHaveProperty("commentableId", post._id);

		post = await Post.find(postsIds[0]);
		const comments = await post.comments().get();
		expect(comments).toEqual(expect.any(Array));
		expect(comments.length).toBe(1);
	});

	it("should return existing doc with 2 params", async () => {
		const postsIds = await Post.insertMany([
			{ title: "Post 1", content: "Content 1" },
			{ title: "Post 2", content: "Content 2" },
		]);

		let post = await Post.find(postsIds[0]);
		await Comment.insertMany([
			{ postId: post._id, content: "Comment 1", active: true },
		]);

		const comment = await post
			.comments()
			.firstOrCreate({ content: "Comment 1" }, { active: true });

		expect(comment).toEqual(expect.any(Object));
		expect(comment).toHaveProperty("_id");
		expect(comment).toHaveProperty("content", "Comment 1");
		expect(comment).toHaveProperty("active", true);
		expect(comment).toHaveProperty("commentableType", Post.name);
		expect(comment).toHaveProperty("commentableId", post._id);

		post = await Post.find(postsIds[0]);
		const comments = await post.comments().get();
		expect(comments).toEqual(expect.any(Array));
		expect(comments.length).toBe(1);
	});
});
