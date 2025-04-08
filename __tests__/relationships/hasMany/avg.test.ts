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
  it("should return avg of docs", async () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      content: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSoftDelete {
      postId: ObjectId;
      content: string;
      active: boolean;
      likes: number;
    }

    class Post extends Model<IPost> {
      static $collection = "posts";
      static $schema: Post;

      comments() {
        return this.hasMany(Comment, "postId", "_id");
      }
    }
    class Comment extends Model<IComment> {
      static $collection = "comments";
      static $useTimestamps = false;
      static $schema: Comment;
    }
    const postsIds = await Post.insertMany([
      { title: "Post 1", content: "Content 1" },
      { title: "Post 2", content: "Content 2" },
    ]);
    await Comment.insertMany([
      { postId: postsIds[0], content: "Comment 1", active: true, likes: 5 },
      { postId: postsIds[0], content: "Comment 2", active: true, likes: 10 },
      { postId: postsIds[1], content: "Comment 3", active: true, likes: 20 },
    ]);
    const post = await Post.find(postsIds[0]);
    const avg = await post.comments().avg("likes");
    expect(avg).toBe(7.5);
  });
});
