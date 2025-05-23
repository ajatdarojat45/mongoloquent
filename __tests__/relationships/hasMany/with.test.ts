import { ObjectId } from "mongodb";

import DB from "../../../src/DB";
import Model from "../../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("flights").getCollection().deleteMany({});
});

afterEach(async () => {
  await DB.collection("posts").getCollection().deleteMany({});
  await DB.collection("comments").getCollection().deleteMany({});
});

describe("with method", () => {
  describe("without soft delete", () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      body: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSchema {
      body: string;
      url: string;
      postId: ObjectId;
    }

    class Post extends Model<IPost> {
      protected $collection: string = "posts";
      static $schema: IPost;

      comments() {
        return this.hasMany(Comment, "postId", "_id");
      }
    }

    class Comment extends Model<IComment> {
      protected $collection: string = "comments";
      static $schema: IComment;
    }

    it("without options", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      await Comment.insertMany([
        { body: "Comment 1", postId: postIds[0], url: "url1" },
        { body: "Comment 2", postId: postIds[0], url: "url2" },
        { body: "Comment 3", postId: postIds[1], url: "url3" },
        { body: "Comment 4", postId: postIds[1], url: "url4" },
      ]);

      const post = await Post.with("comments").first();
      expect(post).toEqual(expect.any(Object));
      expect(post?.comments).toBeInstanceOf(Array);
      expect(post?.comments?.length).toBe(2);
      expect(post?.comments?.[0]).toEqual(expect.any(Object));
      expect(post?.comments?.[0]).toHaveProperty("body");
      expect(post?.comments?.[0]).toHaveProperty("url");
    });

    it("with select options", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      await Comment.insertMany([
        { body: "Comment 1", postId: postIds[0], url: "url1" },
        { body: "Comment 2", postId: postIds[0], url: "url2" },
        { body: "Comment 3", postId: postIds[1], url: "url3" },
        { body: "Comment 4", postId: postIds[1], url: "url4" },
      ]);

      const post = await Post.with("comments", { select: ["body"] }).first();
      expect(post).toEqual(expect.any(Object));
      expect(post?.comments).toBeInstanceOf(Array);
      expect(post?.comments?.length).toBe(2);
      expect(post?.comments?.[0]).toEqual(expect.any(Object));
      expect(post?.comments?.[0]).toHaveProperty("body");
      expect(post?.comments?.[0]).not.toHaveProperty("url");
      expect(post?.comments?.[0]).not.toHaveProperty("postId");
    });

    it("with exclude options", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);
      await Comment.insertMany([
        { body: "Comment 1", postId: postIds[0], url: "url1" },
        { body: "Comment 2", postId: postIds[0], url: "url2" },
        { body: "Comment 3", postId: postIds[1], url: "url3" },
        { body: "Comment 4", postId: postIds[1], url: "url4" },
      ]);
      const post = await Post.with("comments", { exclude: ["url"] }).first();
      expect(post).toEqual(expect.any(Object));
      expect(post?.comments).toBeInstanceOf(Array);
      expect(post?.comments?.length).toBe(2);
      expect(post?.comments?.[0]).toEqual(expect.any(Object));
      expect(post?.comments?.[0]).toHaveProperty("body");
      expect(post?.comments?.[0]).toHaveProperty("postId");
      expect(post?.comments?.[0]).not.toHaveProperty("url");
    });
  });

  describe("with soft delete", () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      body: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSchema, IMongoloquentSoftDelete {
      body: string;
      url: string;
      postId: ObjectId;
    }

    class Post extends Model<IPost> {
      protected $collection: string = "posts";
      static $schema: IPost;

      comments() {
        return this.hasMany(Comment, "postId", "_id");
      }
    }

    class Comment extends Model<IComment> {
      protected $collection: string = "comments";
      static $schema: IComment;
      protected $useSoftDelete: boolean = true;
    }

    it("without options", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      const commentIds = await Comment.insertMany([
        { body: "Comment 1", postId: postIds[0], url: "url1" },
        { body: "Comment 2", postId: postIds[0], url: "url2" },
        { body: "Comment 3", postId: postIds[1], url: "url3" },
        { body: "Comment 4", postId: postIds[1], url: "url4" },
      ]);

      await Comment.where("_id", commentIds[0]).delete();

      const post = await Post.with("comments").where("_id", postIds[0]).first();
      expect(post).toEqual(expect.any(Object));
      expect(post?.comments).toBeInstanceOf(Array);
      expect(post?.comments?.length).toBe(1);
      expect(post?.comments?.[0]).toEqual(expect.any(Object));
      expect(post?.comments?.[0]).toHaveProperty("body", "Comment 2");
      expect(post?.comments?.[0]).toHaveProperty("url", "url2");
    });

    it("with select options", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      const commentIds = await Comment.insertMany([
        { body: "Comment 1", postId: postIds[0], url: "url1" },
        { body: "Comment 2", postId: postIds[0], url: "url2" },
        { body: "Comment 3", postId: postIds[1], url: "url3" },
        { body: "Comment 4", postId: postIds[1], url: "url4" },
      ]);

      await Comment.where("_id", commentIds[0]).delete();

      const post = await Post.with("comments", {
        select: ["body"],
      })
        .where("_id", postIds[0])
        .first();
      expect(post).toEqual(expect.any(Object));
      expect(post?.comments).toBeInstanceOf(Array);
      expect(post?.comments?.length).toBe(1);
      expect(post?.comments?.[0]).toEqual(expect.any(Object));
      expect(post?.comments?.[0]).toHaveProperty("body");
      expect(post?.comments?.[0]).not.toHaveProperty("url");
    });

    it("with exclude options", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      const commentIds = await Comment.insertMany([
        { body: "Comment 1", postId: postIds[0], url: "url1" },
        { body: "Comment 2", postId: postIds[0], url: "url2" },
        { body: "Comment 3", postId: postIds[1], url: "url3" },
        { body: "Comment 4", postId: postIds[1], url: "url4" },
      ]);

      await Comment.where("_id", commentIds[0]).delete();

      const post = await Post.with("comments", {
        exclude: ["url"],
      })
        .where("_id", postIds[0])
        .first();
      expect(post).toEqual(expect.any(Object));
      expect(post?.comments).toBeInstanceOf(Array);
      expect(post?.comments?.length).toBe(1);
      expect(post?.comments?.[0]).toEqual(expect.any(Object));
      expect(post?.comments?.[0]).toHaveProperty("body");
      expect(post?.comments?.[0]).toHaveProperty("postId");
      expect(post?.comments?.[0]).not.toHaveProperty("url");
    });
  });
});
