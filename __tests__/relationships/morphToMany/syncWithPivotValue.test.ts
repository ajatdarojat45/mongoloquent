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

describe("sync method", () => {
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
      .syncWithPivotValue<{ additional: string }>([tagIds[0], tagIds[1]], {
        additional: "test",
      });
    const postTagsAfterSync = await post.tags().get();
    expect(postTagsAfterSync.length).toBe(2);

    const taggables = await DB.collection("taggables").get();
    expect(taggables.length).toBe(2);
    expect(taggables[0]).toHaveProperty("additional");
    expect(taggables[1]).toHaveProperty("additional");
  });
});
