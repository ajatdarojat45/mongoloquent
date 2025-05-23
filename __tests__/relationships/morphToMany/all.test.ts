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

    it("should return all doc", async () => {
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

      const tags = await post.tags().all();
      expect(tags.length).toBe(2);
      expect(tags[0].name).toBe("Tag 1");
      expect(tags[0].active).toBe(true);
      expect(tags[1].name).toBe("Tag 2");
      expect(tags[1].active).toBe(false);
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
      protected $collection = "posts";
      static $schema: IPost;

      tags() {
        return this.morphToMany(Tag, "taggable");
      }
    }

    class Tag extends Model<ITag> {
      protected $collection = "tags";
      static $schema: ITag;
      protected $useSoftDelete: boolean = true;
    }

    it("should return all doc", async () => {
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

      await Tag.destroy(tagIds[0]);

      const tags = await post.tags().all();
      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe("Tag 2");
      expect(tags[0].active).toBe(false);

      const tags2 = await Tag.withTrashed().all();
      expect(tags2.length).toBe(3);
    });
  });
});
