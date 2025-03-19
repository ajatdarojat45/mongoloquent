import { ObjectId } from "mongodb";
import Model from "../../src/Model";

class Post extends Model {
  static $collection = "posts";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  static comments() {
    return this.morphMany(Comment, "commentable");
  }
}

class Video extends Model {
  static $collection = "videos";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  static comments() {
    return this.morphMany(Comment, "commentable");
  }
}

class Comment extends Model {
  static $collection = "commentables";
  static $useSoftDelete = true;
  static $useTimestamps = true;
}

let postIds: ObjectId[];
let videoIds: ObjectId[];

beforeAll(async () => {
  videoIds = await Video.insertMany([
    { name: "Video 1" },
    { name: "Video 2" },
    { name: "Video 3" },
  ]);

  postIds = await Post.insertMany([
    { title: "Post 1" },
    { title: "Post 2" },
    { title: "Post 3" },
  ]);

  const post: any = await Post.find(postIds[0]);
  await post.comments().insertMany([
    {
      text: "Comment 1",
    },
    {
      text: "Comment 2",
    },
  ]);

  const video: any = await Video.find(videoIds[0]);
  await video.comments().insertMany([{ text: "Comment 3" }]);
});

afterAll(async () => {
  const videoCollection = Video["getCollection"]();
  const postCollection = Post["getCollection"]();
  const commentCollection = Comment["getCollection"]();

  await videoCollection.deleteMany({});
  await postCollection.deleteMany({});
  await commentCollection.deleteMany({});
});

describe("morphMany Relation", () => {
  it("Should return related data", async () => {
    const post = await Post.with("comments").where("_id", postIds[0]).first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    expect(post?.comments).toEqual(expect.any(Array));
    expect(post?.comments).toHaveLength(2);
  });

  it("Should return related data from another model", async () => {
    const video = await Video.with("comments")
      .where("_id", videoIds[0])
      .first();

    expect(video).toEqual(expect.any(Object));
    expect(video).toHaveProperty("comments");

    expect(video?.comments).toEqual(expect.any(Array));
    expect(video?.comments).toHaveLength(1);
  });

  it("With selected fields", async () => {
    const post = await Post.with("comments", {
      select: ["text"],
    })
      .where("_id", postIds[0])
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    expect(post?.comments).toEqual(expect.any(Array));
    expect(post?.comments).toHaveLength(2);

    const comment = post?.comments[0];
    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("text");
    expect(comment).not.toHaveProperty("_id");
    expect(comment).not.toHaveProperty("commentableId");
    expect(comment).not.toHaveProperty("commentableType");
  });

  it("With excluded fields", async () => {
    const post = await Post.with("comments", {
      exclude: ["text"],
    })
      .where("_id", postIds[0])
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");

    expect(post?.comments).toEqual(expect.any(Array));
    expect(post?.comments).toHaveLength(2);

    const comment = post?.comments[0];
    expect(comment).toEqual(expect.any(Object));
    expect(comment).not.toHaveProperty("text");
    expect(comment).toHaveProperty("_id");
    expect(comment).toHaveProperty("commentableId", postIds[0]);
    expect(comment).toHaveProperty("commentableType", Post.name);
  });

  it("With has no related data", async () => {
    const post = await Post.with("comments").where("_id", postIds[2]).first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");
    expect(post?.comments).toHaveLength(0);
  });

  it("Querying related data", async () => {
    let post = await Post.with("comments").where("_id", postIds[0]).first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");
    expect(post?.comments).toHaveLength(2);

    const comments = await Post.find(postIds[0])
      .comments()
      .where("text", "Comment 1")
      .get();

    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(1);
  });

  it("add data from related model", async () => {
    let post = await Post.with("comments").where("_id", postIds[2]).first();
    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");
    expect(post?.comments).toHaveLength(0);

    await Post.find(postIds[2]).comments().save({
      text: "newComment 1",
    });

    post = await Post.with("comments").where("_id", postIds[2]).first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");
    expect(post?.comments).toHaveLength(1);
  });

  it("add multiple data from related model", async () => {
    let post = await Post.with("comments").where("_id", postIds[2]).first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");
    expect(post?.comments).toHaveLength(1);

    await Post.find(postIds[2])
      .comments()
      .insertMany([
        {
          text: "newComment 2",
        },
        {
          text: "newComment 3",
        },
      ]);

    post = await Post.with("comments").where("_id", postIds[2]).first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");
    expect(post?.comments).toHaveLength(3);
  });

  it("With softDelete", async () => {
    await Comment.where("text", "newComment 1").delete();

    const post = await Post.with("comments").where("_id", postIds[2]).first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("comments");
    expect(post?.comments).toHaveLength(2);

    const comments = await Post.find(postIds[2]).comments().withTrashed().get();
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(3);
  });
});
