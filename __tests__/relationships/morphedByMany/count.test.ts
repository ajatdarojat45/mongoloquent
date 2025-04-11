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

describe("count method", () => {
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

      posts() {
        return this.morphedByMany(Post, "taggable");
      }
    }

    it("return count of tags", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1" },
        { name: "Post 2" },
      ]);

      const tagIds = await Tag.insertMany([
        { name: "Tag 1", active: true, likes: 0 },
        { name: "Tag 2", active: false, likes: 0 },
        { name: "Tag 3", active: true, likes: 0 },
      ]);

      const post = await Post.find(postIds[0]);
      await post.tags().attach([tagIds[0], tagIds[1]]);
      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach([tagIds[0], tagIds[1]]);

      const tag = await Tag.find(tagIds[0]);
      const count = await tag.posts().count();
      expect(count).toBe(2);
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
      static $useSoftDelete: boolean = true;

      tags() {
        return this.morphToMany(Tag, "taggable");
      }
    }

    class Tag extends Model<ITag> {
      static $collection = "tags";
      static $schema: ITag;
      static $useSoftDelete: boolean = true;

      posts() {
        return this.morphedByMany(Post, "taggable");
      }
    }

    it("return count of tags", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1" },
        { name: "Post 2" },
      ]);

      const tagIds = await Tag.insertMany([
        { name: "Tag 1", active: true, likes: 0 },
        { name: "Tag 2", active: false, likes: 0 },
        { name: "Tag 3", active: true, likes: 0 },
      ]);

      const post = await Post.find(postIds[0]);
      await post.tags().attach([tagIds[0], tagIds[1]]);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach([tagIds[0], tagIds[1]]);

      await Post.destroy(postIds[0]);

      const tag = await Tag.find(tagIds[0]);
      const count = await tag.posts().count();
      expect(count).toBe(1);

      const count2 = await tag.posts().withTrashed().count();
      expect(count2).toBe(2);
    });
  });
});
