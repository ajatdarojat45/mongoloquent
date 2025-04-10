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

    it("without option", async () => {
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

      const post3 = await Post.with("tags").where("_id", postIds[0]).first();
      expect(post3?.tags?.length).toBe(2);
      expect(post3?.tags?.[0]?.name).toBe("Tag 1");
      expect(post3?.tags?.[0]?.active).toBe(true);
    });

    it("with select option", async () => {
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

      const post3 = await Post.with("tags", { select: ["name"] })
        .where("_id", postIds[0])
        .first();
      expect(post3?.tags?.length).toBe(2);
      expect(post3?.tags?.[0]).toHaveProperty("name");
      expect(post3?.tags?.[0]).not.toHaveProperty("active");
    });

    it("with exclude option", async () => {
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

      const post3 = await Post.with("tags", { exclude: ["name"] })
        .where("_id", postIds[0])
        .first();
      expect(post3?.tags?.length).toBe(2);
      expect(post3?.tags?.[0]).not.toHaveProperty("name");
      expect(post3?.tags?.[0]).toHaveProperty("active");
    });
  });

  describe("with soft delete", () => {
    interface IPost extends IMongoloquentSchema {
      name: string;
      tags?: ITag[];
    }

    interface ITag extends IMongoloquentSchema, IMongoloquentSoftDelete {
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
      static $useSoftDelete: boolean = true;
    }

    it("without option", async () => {
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

      await Tag.destroy(tagIds[1]);

      const post3 = await Post.with("tags").where("_id", postIds[0]).first();
      expect(post3?.tags?.length).toBe(1);
      expect(post3?.tags?.[0]?.name).toBe("Tag 1");
      expect(post3?.tags?.[0]?.active).toBe(true);

      const tags = await Tag.withTrashed().get();
      expect(tags.length).toBe(3);
    });

    it("with select option", async () => {
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

      await Tag.destroy(tagIds[1]);

      const post3 = await Post.with("tags", { select: ["name"] })
        .where("_id", postIds[0])
        .first();
      expect(post3?.tags?.length).toBe(1);
      expect(post3?.tags?.[0]).toHaveProperty("name");
      expect(post3?.tags?.[0]).not.toHaveProperty("active");

      const tags = await Tag.withTrashed().get();
      expect(tags.length).toBe(3);
    });

    it("with exclude option", async () => {
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

      await Tag.destroy(tagIds[1]);

      const post3 = await Post.with("tags", { exclude: ["name"] })
        .where("_id", postIds[0])
        .first();
      expect(post3?.tags?.length).toBe(1);
      expect(post3?.tags?.[0]).not.toHaveProperty("name");
      expect(post3?.tags?.[0]).toHaveProperty("active");

      const tags = await Tag.withTrashed().get();
      expect(tags.length).toBe(3);
    });
  });
});
