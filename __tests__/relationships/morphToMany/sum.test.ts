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

describe("sum method", () => {
  describe("without soft delete", () => {
    interface IPost extends IMongoloquentSchema {
      name: string;
      tags?: ITag[];
    }

    interface ITag extends IMongoloquentSchema {
      name: string;
      active: boolean;
      likes: number;
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
      static $useSoftDelete: boolean = true;
    }

    it("return sum of tags", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1" },
        { name: "Post 2" },
      ]);

      const tagIds = await Tag.insertMany([
        { name: "Tag 1", active: true, likes: 5 },
        { name: "Tag 2", active: false, likes: 10 },
        { name: "Tag 3", active: true, likes: 20 },
      ]);

      const post = await Post.find(postIds[0]);
      await post.tags().attach([tagIds[0], tagIds[1]]);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach([tagIds[0], tagIds[1]]);

      const count = await post.tags().sum("likes");
      expect(count).toBe(15);
    });
  });

  describe("with soft delete", () => {
    interface IPost extends IMongoloquentSchema, IMongoloquentSoftDelete {
      name: string;
      tags?: ITag[];
    }

    interface ITag extends IMongoloquentSchema, IMongoloquentSoftDelete {
      name: string;
      active: boolean;
      likes: number;
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
      static $useSoftDelete: boolean = true;
    }

    it("return sum of tags", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1" },
        { name: "Post 2" },
      ]);

      const tagIds = await Tag.insertMany([
        { name: "Tag 1", active: true, likes: 5 },
        { name: "Tag 2", active: false, likes: 10 },
        { name: "Tag 3", active: true, likes: 15 },
      ]);

      await Tag.destroy(tagIds[0]);
      const post = await Post.find(postIds[0]);
      await post.tags().attach([tagIds[0], tagIds[1]]);
      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach([tagIds[0], tagIds[1]]);
      const count = await post.tags().sum("likes");
      expect(count).toBe(10);

      const tags = await Tag.withTrashed().sum("likes");
      expect(tags).toBe(30);
    });
  });
});
