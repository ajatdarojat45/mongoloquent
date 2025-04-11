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

describe("get method", () => {
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

    it("without params", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1", description: "Post 1 description" },
        { name: "Post 2", description: "Post 2 description" },
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

      const tags = await Tag.find(tagIds[0]);
      const posts = await tags.posts().get();
      expect(posts.length).toBe(2);
      expect(posts[0]).toHaveProperty("name", "Post 1");
      expect(posts[0]).toHaveProperty("description", "Post 1 description");
    });

    it("with single params", async () => {
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
      await post.tags().attach(tagIds);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0]);

      const tags = await Tag.find(tagIds[0]);
      const posts = await tags.posts().get("name");
      expect(posts.length).toBe(2);
      expect(posts[0]).toHaveProperty("name", "Post 1");
      expect(posts[0]).not.toHaveProperty("description");
    });

    it("with multiple params", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1", description: "Post 1 description" },
        { name: "Post 2", description: "Post 2 description" },
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

      const tags = await Tag.find(tagIds[0]);
      const posts = await tags.posts().get("name", "description");
      expect(posts.length).toBe(2);
      expect(posts[0]).toHaveProperty("name", "Post 1");
      expect(posts[0]).toHaveProperty("description", "Post 1 description");
    });

    it("with array params", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1", description: "Post 1 description" },
        { name: "Post 2", description: "Post 2 description" },
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

      const tags = await Tag.find(tagIds[0]);
      const posts = await tags.posts().get(["name", "description"]);
      expect(posts.length).toBe(2);
      expect(posts[0]).toHaveProperty("name", "Post 1");
      expect(posts[0]).toHaveProperty("description", "Post 1 description");
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

    it("without param", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1", description: "Post 1 description" },
        { name: "Post 2", description: "Post 2 description" },
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
      const posts = await tag.posts().get();
      expect(posts.length).toBe(1);
      expect(posts[0]).toHaveProperty("name", "Post 2");
      expect(posts[0]).toHaveProperty("description", "Post 2 description");

      const posts2 = await Post.withTrashed().all();
      expect(posts2.length).toBe(2);
    });

    it("with single param", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1", description: "Post 1 description" },
        { name: "Post 2", description: "Post 2 description" },
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
      const posts = await tag.posts().get("name");
      expect(posts.length).toBe(1);
      expect(posts[0]).toHaveProperty("name", "Post 2");
      expect(posts[0]).not.toHaveProperty("description");

      const posts2 = await Post.withTrashed().all();
      expect(posts2.length).toBe(2);
    });

    it("with multiple param", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1", description: "Post 1 description" },
        { name: "Post 2", description: "Post 2 description" },
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
      const posts = await tag.posts().get("name", "description");
      expect(posts.length).toBe(1);
      expect(posts[0]).toHaveProperty("name", "Post 2");
      expect(posts[0]).toHaveProperty("description", "Post 2 description");

      const posts2 = await Post.withTrashed().all();
      expect(posts2.length).toBe(2);
    });

    it("with multiple param", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1", description: "Post 1 description" },
        { name: "Post 2", description: "Post 2 description" },
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
      const posts = await tag.posts().get(["name", "description"]);
      expect(posts.length).toBe(1);
      expect(posts[0]).toHaveProperty("name", "Post 2");
      expect(posts[0]).toHaveProperty("description", "Post 2 description");

      const posts2 = await Post.withTrashed().all();
      expect(posts2.length).toBe(2);
    });
  });
});
