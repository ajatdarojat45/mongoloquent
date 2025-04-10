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

describe("min method", () => {
  it("should return min of docs", async () => {
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
        return this.morphMany(Comment, "commentable");
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

    const post = await Post.find(postsIds[0]);
    await post.comments().saveMany([
      { content: "Comment 1", active: true, likes: 5 },
      { content: "Comment 2", active: true, likes: 10 },
    ]);
    const post2 = await Post.find(postsIds[1]);
    await post2.comments().saveMany([
      { content: "Comment 3", active: true, likes: 3 },
      { content: "Comment 4", active: true, likes: 7 },
    ]);

    const sum = await post.comments().min("likes");
    expect(sum).toBe(5);
  });
});
