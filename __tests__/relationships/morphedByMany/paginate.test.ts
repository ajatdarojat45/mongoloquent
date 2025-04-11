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

describe("paginate method", () => {
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

      posts() {
        return this.morphedByMany(Post, "taggable");
      }
    }

    it("without params", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1" },
        { name: "Post 2" },
        { name: "Post 3" },
      ]);

      const tagIds = await Tag.insertMany([
        { name: "Tag 1", active: true },
        { name: "Tag 2", active: false },
        { name: "Tag 3", active: true },
      ]);

      const post = await Post.find(postIds[0]);
      await post.tags().attach(tagIds);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0], tagIds[1]);

      const post3 = await Post.find(postIds[2]);
      await post3.tags().attach(tagIds[0]);

      const tag = await Tag.find(tagIds[0]);
      const tags = await tag.posts().paginate();
      expect(tags).toEqual(expect.any(Object));
      expect(tags).toHaveProperty("data");
      expect(tags).toHaveProperty("meta");

      expect(tags.data.length).toBe(3);
      expect(tags.meta).toEqual(expect.any(Object));
      expect(tags.meta).toHaveProperty("total", 3);
      expect(tags.meta).toHaveProperty("page", 1);
      expect(tags.meta).toHaveProperty("limit", 15);
      expect(tags.meta).toHaveProperty("lastPage", 1);
    });

    it("with params", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1" },
        { name: "Post 2" },
        { name: "Post 3" },
      ]);

      const tagIds = await Tag.insertMany([
        { name: "Tag 1", active: true },
        { name: "Tag 2", active: false },
        { name: "Tag 3", active: true },
      ]);

      const post = await Post.find(postIds[0]);
      await post.tags().attach(tagIds);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0], tagIds[1]);

      const post3 = await Post.find(postIds[2]);
      await post3.tags().attach(tagIds[0]);

      const tag = await Tag.find(tagIds[0]);
      const tags = await tag.posts().paginate(2, 1);
      expect(tags).toEqual(expect.any(Object));
      expect(tags).toHaveProperty("data");
      expect(tags).toHaveProperty("meta");
      expect(tags.data.length).toBe(1);
      expect(tags.meta).toEqual(expect.any(Object));
      expect(tags.meta).toHaveProperty("total", 3);
      expect(tags.meta).toHaveProperty("page", 2);
      expect(tags.meta).toHaveProperty("limit", 1);
      expect(tags.meta).toHaveProperty("lastPage", 3);
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
        { name: "Post 1" },
        { name: "Post 2" },
        { name: "Post 3" },
      ]);

      const tagIds = await Tag.insertMany([
        { name: "Tag 1", active: true },
        { name: "Tag 2", active: false },
        { name: "Tag 3", active: true },
      ]);

      const post = await Post.find(postIds[0]);
      await post.tags().attach(tagIds);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0], tagIds[1]);

      const post3 = await Post.find(postIds[2]);
      await post3.tags().attach(tagIds[0]);

      await Post.destroy(postIds[0]);

      const tag = await Tag.find(tagIds[0]);
      const tags = await tag.posts().paginate();
      expect(tags).toEqual(expect.any(Object));
      expect(tags).toHaveProperty("data");
      expect(tags).toHaveProperty("meta");
      expect(tags.data.length).toBe(2);
      expect(tags.meta).toEqual(expect.any(Object));
      expect(tags.meta).toHaveProperty("total", 2);
      expect(tags.meta).toHaveProperty("page", 1);
      expect(tags.meta).toHaveProperty("limit", 15);
      expect(tags.meta).toHaveProperty("lastPage", 1);

      const tags2 = await Tag.withTrashed().get();
      expect(tags2.length).toBe(3);
    });

    it("with param", async () => {
      const postIds = await Post.insertMany([
        { name: "Post 1" },
        { name: "Post 2" },
        { name: "Post 3" },
      ]);

      const tagIds = await Tag.insertMany([
        { name: "Tag 1", active: true },
        { name: "Tag 2", active: false },
        { name: "Tag 3", active: true },
      ]);

      const post = await Post.find(postIds[0]);
      await post.tags().attach(tagIds);

      const post2 = await Post.find(postIds[1]);
      await post2.tags().attach(tagIds[0], tagIds[1]);

      const post3 = await Post.find(postIds[2]);
      await post3.tags().attach(tagIds[0]);

      await Post.destroy(postIds[0]);

      const tag = await Tag.find(tagIds[0]);
      const tags = await tag.posts().paginate(2, 1);
      expect(tags).toEqual(expect.any(Object));
      expect(tags).toHaveProperty("data");
      expect(tags).toHaveProperty("meta");

      expect(tags.data.length).toBe(1);
      expect(tags.meta).toEqual(expect.any(Object));
      expect(tags.meta).toHaveProperty("total", 2);
      expect(tags.meta).toHaveProperty("page", 2);
      expect(tags.meta).toHaveProperty("limit", 1);
      expect(tags.meta).toHaveProperty("lastPage", 2);

      const tags2 = await Tag.withTrashed().get();
      expect(tags2.length).toBe(3);
    });
  });
});
