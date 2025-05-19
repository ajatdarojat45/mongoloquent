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
      post: Post;
    }

    class Post extends Model<IPost> {
      static $collection: string = "posts";
      static $schema: IPost;

      comments() {
        return this.morphMany(Comment, "commentable");
      }
    }

    class Comment extends Model<IComment> {
      static $collection: string = "comments";
      static $schema: IComment;

      post() {
        return this.morphTo(Post, "commentable");
      }
    }

    it("without options", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      const post1 = await Post.find(postIds[0]);
      await post1.comments().saveMany([
        { body: "Comment 1", url: "url1" },
        { body: "Comment 2", url: "url2" },
      ]);

      const comment = await Comment.with("post")
        .where("body", "Comment 1")
        .first();
      expect(comment).toEqual(expect.any(Object));
      expect(comment).toHaveProperty("post");
      expect(comment?.post).toHaveProperty("title", "Post 1");
      expect(comment?.post).toHaveProperty("body", "Post 1 body");
    });

    it("with select options", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      const post1 = await Post.find(postIds[0]);
      await post1.comments().saveMany([
        { body: "Comment 1", url: "url1" },
        { body: "Comment 2", url: "url2" },
      ]);

      const comment = await Comment.with("post", {
        select: ["title"],
      })
        .where("body", "Comment 1")
        .first();

      expect(comment).toEqual(expect.any(Object));
      expect(comment).toHaveProperty("post");
      expect(comment?.post).toHaveProperty("title");
      expect(comment?.post).not.toHaveProperty("body");
      expect(comment?.post).not.toHaveProperty("url");
    });

    it("with exclude options", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      const post1 = await Post.find(postIds[0]);
      await post1.comments().saveMany([
        { body: "Comment 1", url: "url1" },
        { body: "Comment 2", url: "url2" },
      ]);

      const comment = await Comment.with("post", {
        exclude: ["body"],
      })
        .where("body", "Comment 1")
        .first();

      expect(comment).toEqual(expect.any(Object));
      expect(comment).toHaveProperty("post");
      expect(comment?.post).toHaveProperty("title");
      expect(comment?.post).not.toHaveProperty("body");
    });
  });

  describe("with soft delete", () => {
    interface IPost extends IMongoloquentSchema, IMongoloquentSoftDelete {
      title: string;
      body: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSchema, IMongoloquentSoftDelete {
      body: string;
      url: string;
      post?: Post;
    }

    class Post extends Model<IPost> {
      static $collection: string = "posts";
      static $schema: IPost;
      static $useSoftDelete: boolean = true;

      comments() {
        return this.morphMany(Comment, "commentable");
      }
    }

    class Comment extends Model<IComment> {
      static $collection: string = "comments";
      static $schema: IComment;
      static $useSoftDelete: boolean = true;

      post() {
        return this.morphTo(Post, "commentable");
      }
    }

    it("should not have post", async () => {
      const postIds = await Post.insertMany([
        { title: "Post 1", body: "Post 1 body" },
        { title: "Post 2", body: "Post 2 body" },
        { title: "Post 3", body: "Post 3 body" },
      ]);

      const post1 = await Post.find(postIds[0]);
      const commentIds = await post1.comments().saveMany([
        { body: "Comment 1", url: "url1" },
        { body: "Comment 2", url: "url2" },
      ]);

      await Post.destroy(postIds[0]);

      const comment = await Comment.with("post")
        .where("_id", commentIds[0])
        .first();

      expect(comment).toEqual(expect.any(Object));
      expect(comment?.post).not.toEqual(expect.any(Object));

      const post = await Post.withTrashed().where("_id", postIds[0]).first();
      expect(post).toEqual(expect.any(Object));
    });
  });
});
