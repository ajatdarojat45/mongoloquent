import { ObjectId } from "mongodb";

import DB from "../../../src/DB";
import Model from "../../../src/Model";
import { IMongoloquentSchema } from "../../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("posts").getCollection().deleteMany({});
  await DB.collection("comments").getCollection().deleteMany({});
});

afterEach(async () => {
  await DB.collection("posts").getCollection().deleteMany({});
  await DB.collection("comments").getCollection().deleteMany({});
});

describe("first method", () => {
  it("without params", async () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      content: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSchema {
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
      { postId: postsIds[1], content: "Comment 1", active: true },
    ]);

    const post = await Post.find(postsIds[0]);

    const comment = await post.comments().where("content", "Comment 1").first();
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("_id");
    expect(comment).toHaveProperty("content", "Comment 1");
    expect(comment).toHaveProperty("active", true);
    expect(comment).toHaveProperty("postId", post._id);
  });

  it("with single param", async () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      content: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSchema {
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
      { postId: postsIds[1], content: "Comment 1", active: true },
    ]);

    const post = await Post.find(postsIds[0]);

    const comment = await post
      .comments()
      .where("content", "Comment 1")
      .first("content");
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("_id");
    expect(comment).toHaveProperty("content", "Comment 1");
    expect(comment).not.toHaveProperty("active", true);
    expect(comment).not.toHaveProperty("postId", post._id);
  });

  it("with multiple params", async () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      content: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSchema {
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
      { postId: postsIds[1], content: "Comment 1", active: true },
    ]);

    const post = await Post.find(postsIds[0]);

    const comment = await post
      .comments()
      .where("content", "Comment 1")
      .first("content", "active");
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("_id");
    expect(comment).toHaveProperty("content", "Comment 1");
    expect(comment).toHaveProperty("active", true);
    expect(comment).not.toHaveProperty("postId", post._id);
  });

  it("with array of params", async () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      content: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSchema {
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
      { postId: postsIds[1], content: "Comment 1", active: true },
    ]);

    const post = await Post.find(postsIds[0]);

    const comment = await post
      .comments()
      .where("content", "Comment 1")
      .first(["content", "active"]);
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("_id");
    expect(comment).toHaveProperty("content", "Comment 1");
    expect(comment).toHaveProperty("active", true);
    expect(comment).not.toHaveProperty("postId", post._id);
  });

  it("should return null if no doc found", async () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      content: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSchema {
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

    const comment = await post.comments().where("content", "Comment 3").first();
    expect(comment).toEqual(null);
  });
});
