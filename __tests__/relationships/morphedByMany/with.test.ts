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

describe("with method", () => {
  describe("without soft delete", () => {
    interface IPost extends IMongoloquentSchema {
      name: string;
      description: string;
      tags?: ITag[];
    }

    interface ITag extends IMongoloquentSchema {
      name: string;
      active: boolean;
      posts?: IPost[];
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

    it("without option", async () => {
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
      await post.tags().attach([tagIds[0], tagIds[1]]);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0]);

      const tag = await Tag.with("posts").where("_id", tagIds[0]).first();
      expect(tag?.posts?.length).toBe(2);
      expect(tag?.posts?.[0]?.name).toBe("Post 1");
      expect(tag?.posts?.[0]?.description).toBe("Post 1 description");
    });

    it("with select option", async () => {
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
      await post.tags().attach([tagIds[0], tagIds[1]]);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0]);

      const tag = await Tag.with("posts", { select: ["name"] })
        .where("_id", tagIds[0])
        .first();
      expect(tag?.posts?.length).toBe(2);
      expect(tag?.posts?.[0]).toHaveProperty("name");
      expect(tag?.posts?.[0]).not.toHaveProperty("description");
    });

    it("with exclude option", async () => {
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
      await post.tags().attach([tagIds[0], tagIds[1]]);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0]);

      const tag = await Tag.with("posts", { exclude: ["name"] })
        .where("_id", tagIds[0])
        .first();

      expect(tag?.posts?.length).toBe(2);
      expect(tag?.posts?.[0]).not.toHaveProperty("name");
      expect(tag?.posts?.[0]).toHaveProperty("description");
    });
  });

  describe("with soft delete", () => {
    interface IPost extends IMongoloquentSchema, IMongoloquentSoftDelete {
      name: string;
      description: string;
      tags?: ITag[];
    }

    interface ITag extends IMongoloquentSchema, IMongoloquentSoftDelete {
      name: string;
      active: boolean;
      posts?: IPost[];
    }

    class Post extends Model<IPost> {
      protected $collection = "posts";
      static $schema: IPost;
      protected $useSoftDelete: boolean = true;

      tags() {
        return this.morphToMany(Tag, "taggable");
      }
    }

    class Tag extends Model<ITag> {
      protected $collection = "tags";
      static $schema: ITag;
      protected $useSoftDelete: boolean = true;

      posts() {
        return this.morphedByMany(Post, "taggable");
      }
    }

    it("without option", async () => {
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
      await post.tags().attach([tagIds[0], tagIds[1]]);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0]);

      await Post.destroy(postIds[0]);

      const tag = await Tag.with("posts").where("_id", tagIds[0]).first();
      expect(tag?.posts?.length).toBe(1);
      expect(tag?.posts?.[0]?.name).toBe("Post 2");
      expect(tag?.posts?.[0]?.description).toBe("Post 2 description");

      const posts = await Post.withTrashed().get();
      expect(posts.length).toBe(2);
    });

    it("with select option", async () => {
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
      await post.tags().attach([tagIds[0], tagIds[1]]);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0]);

      await Post.destroy(postIds[0]);

      const tag = await Tag.with("posts", { select: ["name"] })
        .where("_id", tagIds[0])
        .first();

      expect(tag?.posts?.length).toBe(1);
      expect(tag?.posts?.[0]).toHaveProperty("name");
      expect(tag?.posts?.[0]).not.toHaveProperty("description");

      const posts = await Post.withTrashed().get();
      expect(posts.length).toBe(2);
    });

    it("with exclude option", async () => {
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
      await post.tags().attach([tagIds[0], tagIds[1]]);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0]);

      await Post.destroy(postIds[0]);
      const tag = await Tag.with("posts", { exclude: ["name"] })
        .where("_id", tagIds[0])
        .first();

      expect(tag?.posts?.length).toBe(1);
      expect(tag?.posts?.[0]).not.toHaveProperty("name");
      expect(tag?.posts?.[0]).toHaveProperty("description");

      const posts = await Post.withTrashed().get();
      expect(posts.length).toBe(2);
    });
  });
});
