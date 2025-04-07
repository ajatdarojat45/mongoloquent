import { ObjectId } from "mongodb";

import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IPost extends IMongoloquentSchema {
  title: string;
}

interface IVideo extends IMongoloquentSchema {
  name: string;
}

interface ITag extends IMongoloquentSchema {
  name: string;
}

interface ITaggable extends IMongoloquentSchema {
  tagId: ObjectId;
  taggableId: ObjectId;
  taggableType: string;
}

class Post extends Model<IPost> {
  static $collection = "posts";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  tags() {
    return this.morphToMany(Tag, "taggable");
  }
}

class Video extends Model<IVideo> {
  static $collection = "videos";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  tags() {
    return this.morphToMany(Tag, "taggable");
  }
}

class Tag extends Model<ITag> {
  static $collection = "tags";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  posts() {
    return this.morphedByMany(Post, "taggable");
  }

  videos() {
    return this.morphedByMany(Video, "taggable");
  }
}

class Taggable extends Model<ITaggable> {
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

  const post = await Post.find(postIds[0]);
  await post.tags().attach(tagIds);

  const post2 = await Post.find(postIds[1]);
  await post2.tags().attach(tagIds);

  const video = await Video.find(videoIds[0]);
  await video.tags().attach(tagIds);
});

afterAll(async () => {
  await Post.query()["getCollection"]().deleteMany({});
  await Video.query()["getCollection"]().deleteMany({});
  await Tag.query()["getCollection"]().deleteMany({});
  await Taggable.query()["getCollection"]().deleteMany({});
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

    const post2 = await Post.find(postIds[0]);
    const tags = await post2.tags().where("name", "Tag 1").get();
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

    const post2 = await Post.find(postIds[0]);
    const tags = await post2.tags().withTrashed().get();
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

    const tag2 = await Tag.find(tagIds[0]);

    const posts = await tag2.posts().where("title", "Post 1").get();
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(1);
  });

  it("With softDelete", async () => {
    await Post.destroy(postIds[1]);
    const tag = await Tag.with("posts").where("_id", tagIds[0]).first();
    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("posts");
    expect(tag?.posts).toHaveLength(1);

    const tag2 = await Tag.find(tagIds[0]);
    const posts = await tag2.posts().withTrashed().get();
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(2);
  });
});
