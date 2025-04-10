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

describe("syncWithoutDetach method", () => {
  interface IPost extends IMongoloquentSchema {
    name: string;
    tags?: ITag[];
  }

  interface ITag extends IMongoloquentSchema {
    name: string;
    active: boolean;
  }

  class Post extends Model<IPost> {
    static $collection = "posts";
    static $schema: IPost;

    tags() {
      return this.morphToMany(Tag, "taggable");
    }
  }

  class Tag extends Model<ITag> {
    static $collection = "tags";
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
    await post.tags().attach(tagIds);

    const postTags = await post.tags().get();
    expect(postTags.length).toBe(3);

    await post.tags().syncWithoutDetaching([tagIds[0], tagIds[1]]);
    const postTagsAfterSync = await post.tags().get();
    expect(postTagsAfterSync.length).toBe(3);
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
    await post.tags().attach(tagIds[0]);

    const postTags = await post.tags().get();
    expect(postTags.length).toBe(1);

    await post
      .tags()
      .syncWithoutDetaching<{ additional: string }>([tagIds[2], tagIds[1]], {
        additional: "test",
      });
    const postTagsAfterSync = await post.tags().get();
    expect(postTagsAfterSync.length).toBe(3);

    const taggables = await DB.collection("taggables").get();
    expect(taggables.length).toBe(3);
    expect(taggables[0]).not.toHaveProperty("additional");
    expect(taggables[1]).toHaveProperty("additional");
  });
});
