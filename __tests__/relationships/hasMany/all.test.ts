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

describe("all method", () => {
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
      { postId: postsIds[0], content: "Comment 1", active: true },
      { postId: postsIds[0], content: "Comment 2", active: true },
      { postId: postsIds[1], content: "Comment 3", active: true },
    ]);

    const post = await Post.find(postsIds[0]);

    const comments = await post.comments().all();
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(2);
    expect(comments[0]).toEqual(expect.any(Object));
    expect(comments[0]).toHaveProperty("_id");
    expect(comments[0]).toHaveProperty("postId", post._id);
    expect(comments[0]).toHaveProperty("content", "Comment 1");
    expect(comments[0]).toHaveProperty("active", true);
  });
});
