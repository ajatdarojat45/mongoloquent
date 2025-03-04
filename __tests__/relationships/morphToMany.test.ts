import { ObjectId } from "mongodb";
import Model from "../../src/Model";

class Post extends Model {
  static $collection = "posts";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  static tags() {
    return this.morphToMany(Tag, "taggable");
  }
}

class Video extends Model {
  static $collection = "videos";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  static tags() {
    return this.morphToMany(Tag, "taggable");
  }
}

class Tag extends Model {
  static $collection = "tags";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  static posts() {
    return this.morphedByMany(Post, "taggable");
  }

  static videos() {
    return this.morphedByMany(Video, "taggable");
  }
}

class Taggable extends Model {
  static $collection = "taggables";
}

let postIds: ObjectId[];
let videoIds: ObjectId[];
let tagIds: ObjectId[];

beforeAll(async () => {
  postIds = await Post.insertMany([
    { title: "Post 1" },
    { title: "Post 2" },
    { title: "Post 3" },
  ]);

  videoIds = await Video.insertMany([
    { name: "Video 1" },
    { name: "Video 2" },
    { name: "Video 3" },
  ]);

  tagIds = await Tag.insertMany([
    { name: "Tag 1" },
    { name: "Tag 2" },
    { name: "Tag 3" },
  ]);

  await Post.find(postIds[0]).tags().attach(tagIds);
  await Post.find(postIds[1]).tags().attach(tagIds);
  await Video.find(videoIds[0]).tags().attach(tagIds);
});

afterAll(async () => {
  const postCollection = Post["getCollection"]();
  const videoCollection = Video["getCollection"]();
  const tagCollection = Tag["getCollection"]();
  const taggableCollection = Taggable["getCollection"]();

  await postCollection.deleteMany({});
  await videoCollection.deleteMany({});
  await tagCollection.deleteMany({});
  await taggableCollection.deleteMany({});
});

describe("morphToMany Relation", () => {
  it("Should return related data", async () => {
    const post = await Post.with("tags").where("_id", postIds[0]).first();
    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("tags");

    const tags = post?.tags;
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(3);
  });

  it("With selected field", async () => {
    const post = await Post.with("tags", {
      select: ["name"],
    })
      .where("_id", postIds[0])
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("tags");

    const tags = post?.tags;
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(3);

    const tag = tags[0];
    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("name");
    expect(tag).not.toHaveProperty("_id");
  });

  it("With excluded field", async () => {
    const post = await Post.with("tags", {
      exclude: ["name"],
    })
      .where("_id", postIds[0])
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("tags");

    const tags = post?.tags;
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(3);

    const tag = tags[0];
    expect(tag).toEqual(expect.any(Object));
    expect(tag).not.toHaveProperty("name");
    expect(tag).toHaveProperty("_id");
  });

  it("With querying related data", async () => {
    const post = await Post.with("tags").where("_id", postIds[0]).first();
    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("tags");
    expect(post?.tags).toHaveLength(3);

    const tags = await Post.find(postIds[0])
      .tags()
      .where("name", "Tag 1")
      .get();
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(1);
  });

  it("Should return related data from another model", async () => {
    const video = await Video.with("tags").where("_id", videoIds[0]).first();
    expect(video).toEqual(expect.any(Object));
    expect(video).toHaveProperty("tags");

    const tags = video?.tags;
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(3);
  });

  it("With softDelete", async () => {
    await Tag.destroy(tagIds[2]);
    const post = await Post.with("tags").where("_id", postIds[0]).first();
    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("tags");
    expect(post?.tags).toHaveLength(2);

    const tags = await Post.find(postIds[0]).tags().withTrashed().get();
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(3);
  });
});

describe("morphToMany Relation Reverse", () => {
  it("Should return related data", async () => {
    const tag = await Tag.with("posts").where("_id", tagIds[0]).first();
    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("posts");

    const posts = tag?.posts;
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(2);
  });

  it("Should return related data from another model", async () => {
    const tag = await Tag.with("videos").where("_id", tagIds[0]).first();
    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("videos");

    const videos = tag?.videos;
    expect(videos).toEqual(expect.any(Array));
    expect(videos).toHaveLength(1);
  });

  it("With selected fields", async () => {
    const tag = await Tag.with("posts", {
      select: ["title"],
    })
      .where("_id", tagIds[0])
      .first();
    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("posts");

    const posts = tag?.posts;
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(2);

    const [post] = posts;
    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("title");
    expect(post).not.toHaveProperty("_id");
  });

  it("With excluded fields", async () => {
    const tag = await Tag.with("posts", {
      exclude: ["title"],
    })
      .where("_id", tagIds[0])
      .first();
    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("posts");

    const posts = tag?.posts;
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(2);

    const post = posts[0];
    expect(post).toEqual(expect.any(Object));
    expect(post).not.toHaveProperty("title");
    expect(post).toHaveProperty("_id");
  });

  it("With querying related data", async () => {
    const tag = await Tag.with("posts").where("_id", tagIds[0]).first();
    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("posts");
    expect(tag?.posts).toEqual(expect.any(Array));
    expect(tag?.posts).toHaveLength(2);

    const posts = await Tag.find(tagIds[0])
      .posts()
      .where("title", "Post 1")
      .get();
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(1);
  });

  it("With softDelete", async () => {
    await Post.destroy(postIds[1]);
    const tag = await Tag.with("posts").where("_id", tagIds[0]).first();
    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("posts");
    expect(tag?.posts).toHaveLength(1);

    const posts = await Tag.find(tagIds[0]).posts().withTrashed().get();
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(2);
  });
});
