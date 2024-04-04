import { ObjectId } from "mongodb";
import Model from "../../src/database/Model";

class Post extends Model {
  static collection = "posts";
  static softDelete = true;
  static timestamps = true;

  static tags() {
    return this.morphToMany(Tag, "taggable");
  }
}

class Video extends Model {
  static collection = "videos";
  static softDelete = true;
  static timestamps = true;

  static tags() {
    return this.morphToMany(Tag, "taggable");
  }
}

class Tag extends Model {
  static collection = "roleUser";
  static softDelete = true;
  static timestamps = true;

  static posts() {
    return this.morphedByMany(Post, "taggable");
  }

  static videos() {
    return this.morphedByMany(Video, "taggable");
  }
}

class Taggable extends Model {
  static collection = "taggables";
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

  const post: any = await Post.find(postIds[0]);
  await post.tags().attach(tagIds);

  const post1: any = await Post.find(postIds[1]);
  await post1.tags().attach(tagIds);

  const video: any = await Video.find(videoIds[0]);
  await video.tags().attach(tagIds);
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
    const { data: post }: any = await Post.with("tags").find(postIds[0]);

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("tags");

    const { tags } = post;
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(3);
  });

  it("With selected field", async () => {
    const { data: post }: any = await Post.with("tags", {
      select: ["name"],
    }).find(postIds[0]);

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("tags");

    const { tags } = post;
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(3);

    const [tag] = tags;
    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("name");
    expect(tag).not.toHaveProperty("_id");
  });

  it("With excluded field", async () => {
    const { data: post }: any = await Post.with("tags", {
      exclude: ["name"],
    }).find(postIds[0]);

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("tags");

    const { tags } = post;
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(3);

    const [tag] = tags;
    expect(tag).toEqual(expect.any(Object));
    expect(tag).not.toHaveProperty("name");
    expect(tag).toHaveProperty("_id");
  });

  it("With querying related data", async () => {
    const post: any = await Post.with("tags").find(postIds[0]);

    expect(post.data).toEqual(expect.any(Object));
    expect(post.data).toHaveProperty("tags");
    expect(post.data.tags).toHaveLength(3);

    const tags = await post.tags().where("name", "Tag 1").get();
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(1);
  });

  it("Should return related data from another model", async () => {
    const { data: video }: any = await Video.with("tags").find(videoIds[0]);

    expect(video).toEqual(expect.any(Object));
    expect(video).toHaveProperty("tags");

    const { tags } = video;
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(3);
  });

  it("With softDelete", async () => {
    await Tag.destroy(tagIds[2]);

    const post: any = await Post.with("tags").find(postIds[0]);

    expect(post.data).toEqual(expect.any(Object));
    expect(post.data).toHaveProperty("tags");
    expect(post.data.tags).toHaveLength(2);

    const tags = await post.tags().withTrashed().get();
    expect(tags).toEqual(expect.any(Array));
    expect(tags).toHaveLength(3);
  });
});

describe("morphToMany Relation Reverse", () => {
  it("Should return related data", async () => {
    const { data: tag }: any = await Tag.with("posts").find(tagIds[0]);

    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("posts");

    const { posts } = tag;
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(2);
  });

  it("Should return related data from another model", async () => {
    const { data: tag }: any = await Tag.with("videos").find(tagIds[0]);

    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("videos");

    const { videos } = tag;
    expect(videos).toEqual(expect.any(Array));
    expect(videos).toHaveLength(1);
  });

  it("With selected fields", async () => {
    const { data: tag }: any = await Tag.with("posts", {
      select: ["title"],
    }).find(tagIds[0]);

    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("posts");

    const { posts } = tag;
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(2);

    const [post] = posts;
    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("title");
    expect(post).not.toHaveProperty("_id");
  });

  it("With excluded fields", async () => {
    const { data: tag }: any = await Tag.with("posts", {
      exclude: ["title"],
    }).find(tagIds[0]);

    expect(tag).toEqual(expect.any(Object));
    expect(tag).toHaveProperty("posts");

    const { posts } = tag;
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(2);

    const [post] = posts;
    expect(post).toEqual(expect.any(Object));
    expect(post).not.toHaveProperty("title");
    expect(post).toHaveProperty("_id");
  });

  it("With querying related data", async () => {
    const tag: any = await Tag.with("posts").find(tagIds[0]);

    expect(tag.data).toEqual(expect.any(Object));
    expect(tag.data).toHaveProperty("posts");
    expect(tag.data.posts).toEqual(expect.any(Array));
    expect(tag.data.posts).toHaveLength(2);

    const posts = await tag.posts().where("title", "Post 1").get();
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(1);
  });

  it("With softDelete", async () => {
    await Post.destroy(postIds[1]);

    const tag: any = await Tag.with("posts").find(tagIds[0]);

    expect(tag.data).toEqual(expect.any(Object));
    expect(tag.data).toHaveProperty("posts");
    expect(tag.data.posts).toHaveLength(1);

    const posts = await tag.posts().withTrashed().get();
    expect(posts).toEqual(expect.any(Array));
    expect(posts).toHaveLength(2);
  });
});
