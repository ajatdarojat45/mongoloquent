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
      comment?: Comment;
    }

    interface IComment extends IMongoloquentSchema {
      body: string;
      url: string;
      commentableId: ObjectId;
      commentableType: string;
      post?: Post;
    }

    class Post extends Model<IPost> {
      protected $collection: string = "posts";
      static $schema: IPost;

      comment() {
        return this.morphTo(Comment, "commentable");
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
        {
          body: "Comment 1",
          url: "url1",
          commentableId: postIds[0],
          commentableType: "Post",
        },
        {
          body: "Comment 2",
          url: "url2",
          commentableId: postIds[0],
          commentableType: "Post",
        },
        {
          body: "Comment 3",
          url: "url3",
          commentableId: postIds[1],
          commentableType: "Post",
        },
      ]);

      const post = await Post.with("comment").first();
      expect(post).toEqual(expect.any(Object));
      expect(post).toHaveProperty("comment");
      expect(post?.comment).toHaveProperty("body", "Comment 1");
      expect(post?.comment).toHaveProperty("url", "url1");
    });

    it("with select options", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      await Comment.insertMany([
        {
          body: "Comment 1",
          url: "url1",
          commentableId: postIds[0],
          commentableType: "Post",
        },
        {
          body: "Comment 2",
          url: "url2",
          commentableId: postIds[0],
          commentableType: "Post",
        },
        {
          body: "Comment 3",
          url: "url3",
          commentableId: postIds[1],
          commentableType: "Post",
        },
      ]);

      const post = await Post.with("comment", {
        select: ["body"],
      }).first();

      expect(post).toEqual(expect.any(Object));
      expect(post).toHaveProperty("comment");
      expect(post?.comment).toHaveProperty("body");
      expect(post?.comment).not.toHaveProperty("url");
    });

    it("with exclude options", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      await Comment.insertMany([
        {
          body: "Comment 1",
          url: "url1",
          commentableId: postIds[0],
          commentableType: "Post",
        },
        {
          body: "Comment 2",
          url: "url2",
          commentableId: postIds[0],
          commentableType: "Post",
        },
        {
          body: "Comment 3",
          url: "url3",
          commentableId: postIds[1],
          commentableType: "Post",
        },
      ]);

      const post = await Post.with("comment", {
        exclude: ["body"],
      }).first();

      expect(post).toEqual(expect.any(Object));
      expect(post).toHaveProperty("comment");
      expect(post?.comment).toHaveProperty("url");
      expect(post?.comment).not.toHaveProperty("body");
    });
  });

  describe("with soft delete", () => {
    interface IPost extends IMongoloquentSchema, IMongoloquentSoftDelete {
      title: string;
      body: string;
      comment?: Comment;
    }

    interface IComment extends IMongoloquentSchema, IMongoloquentSoftDelete {
      body: string;
      url: string;
      commentableId: ObjectId;
      commentableType: string;
    }

    class Post extends Model<IPost> {
      protected $collection: string = "posts";
      static $schema: IPost;
      protected $useSoftDelete: boolean = true;

      comment() {
        return this.morphTo(Comment, "commentable");
      }
    }

    class Comment extends Model<IComment> {
      protected $collection: string = "comments";
      static $schema: IComment;
      protected $useSoftDelete: boolean = true;
    }

    it("should not have post", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      const commentIds = await Comment.insertMany([
        {
          body: "Comment 1",
          url: "url1",
          commentableId: postIds[0],
          commentableType: "Post",
        },
        {
          body: "Comment 3",
          url: "url3",
          commentableId: postIds[1],
          commentableType: "Post",
        },
      ]);

      await Comment.destroy(commentIds[0]);

      const post = await Post.with("comment").first();

      expect(post).toEqual(expect.any(Object));
      expect(post?.comment).not.toEqual(expect.any(Object));

      const comment = await Comment.withTrashed()
        .where("_id", commentIds[0])
        .first();
      expect(comment).toEqual(expect.any(Object));
    });
  });
});
