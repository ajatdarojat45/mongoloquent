import exp from "constants";
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

describe("associate method", () => {
  it("should associate a comment with a post", async () => {
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
    ]);

    let comment = await Comment.with("post")
      .where("_id", commentIds[0])
      .first();

    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("postId", postsIds[0]);
    expect(comment).toHaveProperty("post");
    expect(comment?.post).toEqual(expect.any(Object));
    expect(comment?.post).toHaveProperty("_id", postsIds[0]);

    const post = await Post.find(postsIds[1]);
    let comment2 = await Comment.find(commentIds[0]);
    comment2?.post().associate(post);
    comment2?.save();

    comment = await Comment.with("post").where("_id", commentIds[0]).first();
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("postId", postsIds[1]);
    expect(comment).toHaveProperty("post");
    expect(comment?.post).toEqual(expect.any(Object));
    expect(comment?.post).toHaveProperty("_id", postsIds[1]);
  });
});
