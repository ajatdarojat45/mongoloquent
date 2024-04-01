import { ObjectId } from "mongodb";
import Model from "../../src/database/Model";

class Post extends Model {
  static collection = "posts";
  static timestamps = true;
  static softDelete = true;

  static comments() {
    return this.hasMany(Comment, "postId", "_id");
  }
}

class Comment extends Model {
  static collection = "comments";
  static timestamps = true;
  static softDelete = true;

  static post() {
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
    },
    {
      text: "Comment 2",
      postId: postIds[0],
    },
    {
      text: "Comment 3",
      postId: postIds[0],
    },
    {
      text: "Comment 4",
      postId: postIds[1],
    },
  ]);
});

afterAll(async () => {
  const postCollection = Post["getCollection"]();
  const commentCollection = Comment["getCollection"]();

  await postCollection.deleteMany({});
  await commentCollection.deleteMany({});
});

describe("hasMany Relation", () => {
  it("Should return related data", async () => {
    const { data: post }: any = await Post.with("comments")
      .where("title", "Post 1")
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(3);

    const comment = comments[0];
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("postId", post._id);
  });

  it("With selected fields", async () => {
    const { data: post }: any = await Post.with("comments", {
      select: ["text"],
    })
      .where("title", "Post 1")
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(3);

    const comment = comments[0];
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("text");
    expect(comment).not.toHaveProperty("_id");
    expect(comment).not.toHaveProperty("postId");
  });

  it("With excluded fields", async () => {
    const { data: post }: any = await Post.with("comments", {
      exclude: ["text"],
    })
      .where("title", "Post 1")
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(3);

    const comment = comments[0];
    expect(comment).toEqual(expect.any(Object));
    expect(comment).not.toHaveProperty("text");
    expect(comment).toHaveProperty("_id");
    expect(comment).toHaveProperty("postId", post._id);
  });

  it("With has no related data", async () => {
    const { data: post }: any = await Post.with("comments", {
      exclude: ["text"],
    }).find(postIds[2]);

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(0);
  });

  it("Querying related data", async () => {
    const post: any = await Post.with("comments").find(postIds[0]);
    const comments = await post.comments().where("text", "Comment 1").get();

    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(1);
  });

  it("with softDelete", async () => {
    await Comment.destroy(commentIds[0]);

    const { data: post }: any = await Post.with("comments").find(postIds[0]);

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(2);

    const _comments = await Comment.withTrashed()
      .where("postId", postIds[0])
      .get();

    expect(_comments).toEqual(expect.any(Array));
    expect(_comments).toHaveLength(3);
  });
});
