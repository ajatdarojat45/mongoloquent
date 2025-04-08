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

describe("with method", () => {
  it("without options", async () => {
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
    }

    class Comment extends Model<IComment> {
      static $collection = "comments";
      static $useTimestamps = false;
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

    const comment = await Comment.with("post")
      .where("_id", commentIds[0])
      .first();

    expect(comment).toBeInstanceOf(Comment);
    expect(comment).toHaveProperty("post");
    expect(comment).toHaveProperty("postId", postsIds[0]);
    expect(comment?.post).toEqual(expect.any(Object));
    expect(comment?.post).toHaveProperty("_id", postsIds[0]);
    expect(comment?.post).toHaveProperty("title", "Post 1");
    expect(comment?.post).toHaveProperty("content", "Content 1");
  });

  it("with select options", async () => {
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
    }

    class Comment extends Model<IComment> {
      static $collection = "comments";
      static $useTimestamps = false;
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

    const comment = await Comment.with("post", { select: ["title"] })
      .where("_id", commentIds[0])
      .first();

    expect(comment).toBeInstanceOf(Comment);
    expect(comment).toHaveProperty("post");
    expect(comment).toHaveProperty("postId", postsIds[0]);
    expect(comment?.post).toEqual(expect.any(Object));
    expect(comment?.post).toHaveProperty("title", "Post 1");
    expect(comment?.post).not.toHaveProperty("_id", postsIds[0]);
    expect(comment?.post).not.toHaveProperty("content", "Content 1");
  });

  it("with exclude options", async () => {
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
    }

    class Comment extends Model<IComment> {
      static $collection = "comments";
      static $useTimestamps = false;
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

    const comment = await Comment.with("post", { exclude: ["title"] })
      .where("_id", commentIds[0])
      .first();

    expect(comment).toBeInstanceOf(Comment);
    expect(comment).toHaveProperty("post");
    expect(comment).toHaveProperty("postId", postsIds[0]);
    expect(comment?.post).toEqual(expect.any(Object));
    expect(comment?.post).not.toHaveProperty("title", "Post 1");
    expect(comment?.post).toHaveProperty("_id", postsIds[0]);
    expect(comment?.post).toHaveProperty("content", "Content 1");
  });
});
