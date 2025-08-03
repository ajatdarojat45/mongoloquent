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

describe("paginate method", () => {
	it("should return paginated results", async () => {
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
		}

		class Comment extends Model<IComment> {
			protected $collection = "comments";
			protected $useTimestamps = false;
			static $schema: Comment;

			post() {
				return this.belongsTo(Post, "postId", "_id");
			}
		}

		const postsIds = await Post.insertMany([
			{ title: "Post 1", content: "Content 1" },
			{ title: "Post 2", content: "Content 2" },
		]);

		const commentIds = await Comment.insertMany([
			{ postId: postsIds[0], content: "Comment 1", active: true },
			{ postId: postsIds[0], content: "Comment 2", active: true },
			{ postId: postsIds[1], content: "Comment 3", active: true },
		]);

		const comment = await Comment.find(commentIds[0]);
		const posts = await comment.post().paginate();
		expect(posts).toHaveProperty("data");
		expect(posts).toHaveProperty("meta");

		const data = posts.data;
		expect(data).toHaveLength(1);

		const meta = posts.meta;
		expect(meta).toHaveProperty("total", 1);
		expect(meta).toHaveProperty("page", 1);
		expect(meta).toHaveProperty("limit", 15);
		expect(meta).toHaveProperty("lastPage", 1);
	});
});
