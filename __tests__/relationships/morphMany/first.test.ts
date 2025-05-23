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
  interface IPost extends IMongoloquentSchema {
    title: string;
    content: string;
    comments?: Comment[];
  }

  interface IComment extends IMongoloquentSchema {
    content: string;
    active: boolean;
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

  it("without params", async () => {
    const postsIds = await Post.insertMany([
      { title: "Post 1", content: "Content 1" },
      { title: "Post 2", content: "Content 2" },
    ]);

    const post = await Post.find(postsIds[0]);
    await post.comments().saveMany([
      { content: "Comment 1", active: true },
      { content: "Comment 2", active: true },
    ]);

    const comment = await post.comments().where("content", "Comment 1").first();
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("_id");
    expect(comment).toHaveProperty("content", "Comment 1");
    expect(comment).toHaveProperty("active", true);
  });

  it("with single param", async () => {
    const postsIds = await Post.insertMany([
      { title: "Post 1", content: "Content 1" },
      { title: "Post 2", content: "Content 2" },
    ]);

    const post = await Post.find(postsIds[0]);
    await post.comments().saveMany([
      { content: "Comment 1", active: true },
      { content: "Comment 2", active: true },
    ]);

    const comment = await post
      .comments()
      .where("content", "Comment 1")
      .first("content");
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("_id");
    expect(comment).toHaveProperty("content", "Comment 1");
    expect(comment).not.toHaveProperty("active", true);
  });

  it("with multiple params", async () => {
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
    await post.comments().saveMany([
      { content: "Comment 1", active: true },
      { content: "Comment 2", active: true },
    ]);

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
    const postsIds = await Post.insertMany([
      { title: "Post 1", content: "Content 1" },
      { title: "Post 2", content: "Content 2" },
    ]);

    const post = await Post.find(postsIds[0]);
    await post.comments().saveMany([
      { content: "Comment 1", active: true },
      { content: "Comment 2", active: true },
    ]);

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
    const postsIds = await Post.insertMany([
      { title: "Post 1", content: "Content 1" },
      { title: "Post 2", content: "Content 2" },
    ]);

    const post = await Post.find(postsIds[0]);
    await post.comments().saveMany([
      { content: "Comment 1", active: true },
      { content: "Comment 2", active: true },
    ]);

    const post2 = await Post.find(postsIds[1]);
    await post2.comments().saveMany([
      { content: "Comment 3", active: true },
      { content: "Comment 4", active: true },
    ]);

    const comment = await post.comments().where("content", "Comment 3").first();
    expect(comment).toEqual(null);
  });
});
