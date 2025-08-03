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

describe("sum method", () => {
	it("should return sum of docs", async () => {
		interface IPost extends IMongoloquentSchema {
			title: string;
			content: string;
			comments?: Comment[];
		}

		interface IComment extends IMongoloquentSoftDelete {
			content: string;
			active: boolean;
			likes: number;
		}

		class Post extends Model<IPost> {
			protected $collection = "posts";
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
		const postsIds = await Post.insertMany([
			{ title: "Post 1", content: "Content 1" },
			{ title: "Post 2", content: "Content 2" },
		]);

		const post = await Post.find(postsIds[0]);
		await post.comments().saveMany([
			{ content: "Comment 1", active: true, likes: 5 },
			{ content: "Comment 2", active: true, likes: 10 },
		]);

		const post2 = await Post.find(postsIds[1]);
		await post2.comments().saveMany([
			{ content: "Comment 3", active: true, likes: 3 },
			{ content: "Comment 4", active: true, likes: 2 },
		]);

		const sum = await post.comments().sum("likes");
		expect(sum).toBe(15);
	});
});
