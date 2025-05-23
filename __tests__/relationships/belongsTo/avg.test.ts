import { ObjectId } from "mongodb";

import DB from "../../../src/DB";
import Model from "../../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("posts").getCollection().deleteMany({});
  await DB.collection("comments").getCollection().deleteMany({});
});

afterEach(async () => {
  await DB.collection("posts").getCollection().deleteMany({});
  await DB.collection("comments").getCollection().deleteMany({});
});

describe("avg method", () => {
  it("should return the avg of related docs", async () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      content: string;
      likes: number;
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
      { title: "Post 1", content: "Content 1", likes: 10 },
      { title: "Post 2", content: "Content 2", likes: 20 },
    ]);

    const commentIds = await Comment.insertMany([
      { postId: postsIds[0], content: "Comment 1", active: true },
      { postId: postsIds[0], content: "Comment 2", active: true },
      { postId: postsIds[1], content: "Comment 3", active: true },
    ]);

    const comment = await Comment.find(commentIds[0]);
    const avg = await comment.post().avg("likes");
    expect(avg).toBe(10);
  });
});
