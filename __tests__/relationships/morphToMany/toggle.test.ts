import DB from "../../../src/DB";
import Model from "../../../src/Model";
import { IMongoloquentSchema } from "../../../src/interfaces/ISchema";

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

describe("toggle method", () => {
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

  it("toggle", async () => {
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
    await post.tags().toggle(tagIds[0]);
    const postTags = await post.tags().get();
    expect(postTags.length).toBe(1);

    await post.tags().toggle(tagIds);
    const postTags2 = await post.tags().get();
    expect(postTags2.length).toBe(2);
  });
});
