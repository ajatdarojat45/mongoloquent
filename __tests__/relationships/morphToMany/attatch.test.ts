import DB from "../../../src/DB";
import Model from "../../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("posts").getCollection().deleteMany({});
  await DB.collection("tags").getCollection().deleteMany({});
  await DB.collection("taggables").getCollection().deleteMany({});
});

afterEach(async () => {
  await DB.collection("posts").getCollection().deleteMany({});
  await DB.collection("tags").getCollection().deleteMany({});
  await DB.collection("taggables").getCollection().deleteMany({});
});

describe("attach method", () => {
  interface IPost extends IMongoloquentSchema {
    name: string;
    tags?: ITag[];
  }

  interface ITag extends IMongoloquentSchema {
    name: string;
    active: boolean;
  }

  class Post extends Model<IPost> {
    protected $collection = "posts";
    static $schema: IPost;

    tags() {
      return this.morphToMany(Tag, "taggable");
    }
  }

  class Tag extends Model<ITag> {
    protected $collection = "tags";
    static $schema: ITag;
  }

  it("without values", async () => {
    const postIds = await Post.insertMany([
      { name: "Post 1" },
      { name: "Post 2" },
      { name: "Post 3" },
    ]);

    const tagIds = await Tag.insertMany([
      { name: "Tag 1", active: true },
      { name: "Tag 2", active: true },
      { name: "Tag 3", active: true },
    ]);

    const post = await Post.find(postIds[0]);
    await post.tags().attach(tagIds[0]);
    const postTags = await post.tags().get();
    expect(postTags.length).toBe(1);
  });

  it("with values", async () => {
    const postIds = await Post.insertMany([
      { name: "Post 1" },
      { name: "Post 2" },
      { name: "Post 3" },
    ]);

    const tagIds = await Tag.insertMany([
      { name: "Tag 1", active: true },
      { name: "Tag 2", active: true },
      { name: "Tag 3", active: true },
    ]);

    const post = await Post.find(postIds[0]);
    await post
      .tags()
      .attach<{ additional: string }>(tagIds[0], { additional: "test" });
    const postTags = await post.tags().get();
    expect(postTags.length).toBe(1);

    const tags = await DB.collection<any>("taggables").get();
    expect(tags).toEqual(expect.any(Array));
    expect(tags.length).toBe(1);
    expect(tags[0].taggableId.toString()).toBe(postIds[0].toString());
    expect(tags[0].taggableType).toBe("Post");
    expect(tags[0].tagId.toString()).toBe(tagIds[0].toString());
    expect(tags[0].additional).toBe("test");
  });
});
