import { ObjectId } from "mongodb";

import DB from "../../../src/DB";
import Model from "../../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("comments").getCollection().deleteMany({});
  await DB.collection("posts").getCollection().deleteMany({});
});

afterEach(async () => {
  await DB.collection("posts").getCollection().deleteMany({});
  await DB.collection("comments").getCollection().deleteMany({});
});

describe("get method", () => {
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

    it("return all doc", async () => {
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
          commentableId: postIds[1],
          commentableType: "Post",
        },
      ]);

      const post = await Post.find(postIds[0]);
      const comments = await post.comment().get();
      expect(comments.length).toBe(1);
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
      post?: Post;
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

    it("return all doc", async () => {
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
          body: "Comment 2",
          url: "url2",
          commentableId: postIds[1],
          commentableType: "Post",
        },
      ]);

      await Comment.destroy(commentIds[0]);

      const post = await Post.find(postIds[0]);
      const comments = await post.comment().get();
      expect(comments.length).toBe(0);

      const comments2 = await post.comment().withTrashed().get();
      expect(comments2.length).toBe(1);
    });
  });
});
