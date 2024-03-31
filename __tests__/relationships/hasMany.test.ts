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

beforeAll(async () => {
  const postIds = await Post.insertMany([
    {
      title: "Post 1",
      description: "Post 1",
    },
    {
      title: "Post 2",
      description: "Post 2",
    },
  ]);

  await Comment.insertMany([
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
    })
      .where("title", "Post 2")
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(0);
  });

  it("with softDelete", async () => {
    await Comment.where("text", "Comment 1").delete();

    const { data: post }: any = await Post.with("comments")
      .where("title", "Post 1")
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    const comments = post.comments;
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(2);

    const _comments = await Comment.withTrashed()
      .where("postId", post._id)
      .get();

    expect(_comments).toEqual(expect.any(Array));
    expect(_comments).toHaveLength(3);
  });
});
