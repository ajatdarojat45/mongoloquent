import DB from "../../../src/DB";
import Model from "../../../src/Model";
import { IMongoloquentSchema } from "../../../src/interfaces/ISchema";
import MorphToMany from "../../../src/relations/MorphToMany";

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

describe("first method", () => {
  it("return data", async () => {
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

      posts() {
        return this.morphedByMany(Post, "taggable");
      }
    }

    const postIds = await Post.insertMany([
      { name: "Post 1" },
      { name: "Post 2" },
    ]);

    const tagIds = await Tag.insertMany([
      { name: "Tag 1", active: true },
      { name: "Tag 2", active: false },
      { name: "Tag 3", active: true },
    ]);

    const post = await Post.find(postIds[0]);
    await post.tags().attach([tagIds[0], tagIds[1]]);

    const tag = await Tag.find(tagIds[0]);
    const tag2 = await post.tags().where("name", "Tag 1").first();
    expect(tag2).toEqual(expect.any(Object));
    expect(tag2?.name).toBe("Tag 1");
  });

  it("return null", async () => {
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

      posts() {
        return this.morphedByMany(Post, "taggable");
      }
    }

    const postIds = await Post.insertMany([
      { name: "Post 1" },
      { name: "Post 2" },
    ]);

    const tagIds = await Tag.insertMany([
      { name: "Tag 1", active: true },
      { name: "Tag 2", active: false },
      { name: "Tag 3", active: true },
    ]);

    const post = await Post.find(postIds[0]);
    await post.tags().attach([tagIds[0], tagIds[1]]);

    const post2 = await Post.find(postIds[1]);
    await post2.tags().attach(tagIds[2]);

    const tag = await Tag.find(tagIds[0]);
    const tag2 = await post.tags().where("name", "Tag 3").first();
    expect(tag2).toBeNull();
  });
});
