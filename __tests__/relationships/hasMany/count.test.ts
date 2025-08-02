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

describe("count method", () => {
	it("should return count of docs", async () => {
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
		const count = await post.comments().count();
		expect(count).toBe(2);
	});
});
