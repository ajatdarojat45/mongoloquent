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

describe("all method", () => {
  describe("without soft delete", () => {
    interface IPost extends IMongoloquentSchema {
      name: string;
      description?: string;
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

    it("should return all doc", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1", description: "Post 1" },
        { name: "Post 2", description: "Post 2" },
      ]);

      const tagIds = await Tag.insertMany([
        { name: "Tag 1", active: true },
        { name: "Tag 2", active: false },
        { name: "Tag 3", active: true },
      ]);

      const post = await Post.find(postIds[0]);
      await post.tags().attach(tagIds);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0]);

      const tag = await Tag.find(tagIds[0]);
      const posts = await tag.posts().all();
      expect(posts.length).toBe(2);
      expect(posts[0]).toHaveProperty("name");
      expect(posts[0]).toHaveProperty("description");
    });
  });

  describe("with soft delete", () => {
    interface IPost extends IMongoloquentSchema, IMongoloquentSoftDelete {
      name: string;
      description?: string;
      tags?: ITag[];
    }

    interface ITag extends IMongoloquentSchema, IMongoloquentSoftDelete {
      name: string;
      active: boolean;
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

    it("should return all doc", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1", description: "Post 1" },
        { name: "Post 2", description: "Post 2" },
      ]);

      const tagIds = await Tag.insertMany([
        { name: "Tag 1", active: true },
        { name: "Tag 2", active: false },
        { name: "Tag 3", active: true },
      ]);

      const post = await Post.find(postIds[0]);
      await post.tags().attach(tagIds);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0]);

      await Post.destroy(postIds[0]);

      const tag = await Tag.find(tagIds[0]);
      const posts = await tag.posts().all();
      expect(posts.length).toBe(1);
      expect(posts[0]).toHaveProperty("name");
      expect(posts[0]).toHaveProperty("description");

      const posts2 = await Post.withTrashed().get();
      expect(posts2.length).toBe(2);
    });
  });
});
