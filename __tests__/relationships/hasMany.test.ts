import { ObjectId } from "mongodb";

import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IPost extends IMongoloquentSchema {
  title: string;
  description: string;
}
interface IComment extends IMongoloquentSchema {
  text: string;
  postId: ObjectId;
}

class Post extends Model<IPost> {
  static $collection = "posts";

  comments() {
    return this.hasMany(Comment, "postId", "_id");
  }
}

class Comment extends Model<IComment> {
  static $collection = "comments";
  static $useSoftDelete = true;

  post() {
    return this.belongsTo(Post, "postId", "_id");
  }
}

let postIds: ObjectId[];
let commentIds: ObjectId[];

beforeAll(async () => {
  postIds = await Post.insertMany([
    {
      title: "Post 1",
      description: "Post 1",
    },
    {
      title: "Post 2",
      description: "Post 2",
    },
    {
      title: "Post 3",
      description: "Post 3",
    },
  ]);
  commentIds = await Comment.insertMany([
    {
      text: "Comment 1",
      postId: postIds[0],
      ["isDeleted"]: false,
    },
    {
      text: "Comment 2",
      postId: postIds[0],
      ["isDeleted"]: false,
    },
    {
      text: "Comment 3",
      postId: postIds[0],
      ["isDeleted"]: false,
    },
    {
      text: "Comment 4",
      postId: postIds[1],
      ["isDeleted"]: false,
    },
  ]);
});

afterAll(async () => {
  await Post["query"]().forceDestroy();
  await Comment["query"]().forceDestroy();
});

describe("hasMany Relation", () => {
  it("Should return related data", async () => {
    const post = await Post.with("comments").where("title", "Post 1").first();
    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post?.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(3);

    const comment = comments[0];
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("postId", post?._id);
  });

  it("With selected fields", async () => {
    const post = await Post.with("comments", {
      select: ["text"],
    })
      .where("title", "Post 1")
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post?.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(3);

    const comment = comments[0];
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("text");
    expect(comment).not.toHaveProperty("_id");
    expect(comment).not.toHaveProperty("postId");
  });

  it("With excluded fields", async () => {
    const post = await Post.with("comments", {
      exclude: ["text"],
    })
      .where("title", "Post 1")
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post?.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(3);

    const comment = comments[0];
    expect(comment).toEqual(expect.any(Object));
    expect(comment).not.toHaveProperty("text");
    expect(comment).toHaveProperty("_id");
    expect(comment).toHaveProperty("postId", post?._id);
  });

  it("With has no related data", async () => {
    const post = await Post.with("comments", {
      exclude: ["text"],
    })
      .where("_id", postIds[2])
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post?.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(0);
  });

  it("Querying related data", async () => {
    const post = await Post.find(postIds[0]);
    const comments = await post.comments().where("text", "Comment 1").get();

    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(1);
  });

  it("Add data from related model", async () => {
    const post = await Post.find(postIds[0]);
    const newComment = await post.comments().save({
      text: "New Comment",
    });

    expect(newComment).toEqual(expect.any(Object));
    expect(newComment).toHaveProperty("text", "New Comment");
    expect(newComment).toHaveProperty("postId", postIds[0]);

    const comments = await post.comments().get();
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(4);
  });

  it("Add multiple data from related model", async () => {
    const post = await Post.find(postIds[0]);

    await post
      .comments()
      .saveMany([{ text: "New Comment 2" }, { text: "New Comment 3" }]);

    const comments = await post.comments().get();
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(6);
  });

  it("With softDelete", async () => {
    await Comment.destroy(commentIds[0]);

    const post = await Post.with("comments").where("_id", postIds[0]).first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post?.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(5);

    const _comments = await Comment.withTrashed()
      .where("postId", postIds[0])
      .get();

    expect(_comments).toEqual(expect.any(Array));
    expect(_comments).toHaveLength(6);
  });
});
