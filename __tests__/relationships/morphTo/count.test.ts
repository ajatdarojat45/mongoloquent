import Model from "../../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../../src/interfaces/ISchema";

describe("count method", () => {
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
      protected $collection: string = "posts";
      static $schema: IPost;

      comments() {
        return this.morphMany(Comment, "commentable");
      }
    }

    class Comment extends Model<IComment> {
      protected $collection: string = "comments";
      static $schema: IComment;

      post() {
        return this.morphTo(Post, "commentable");
      }
    }

    it("return all doc", async () => {
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

      const comment1 = await Comment.find(commentIds[0]);
      const posts = await comment1.post().count();
      expect(posts).toBe(1);
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
      post: Post;
    }

    class Post extends Model<IPost> {
      protected $collection: string = "posts";
      static $schema: IPost;
      protected $useSoftDelete: boolean = true;

      comments() {
        return this.morphMany(Comment, "commentable");
      }
    }

    class Comment extends Model<IComment> {
      protected $collection: string = "comments";
      static $schema: IComment;
      protected $useSoftDelete: boolean = true;

      post() {
        return this.morphTo(Post, "commentable");
      }
    }

    it("return all doc", async () => {
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

      const comment1 = await Comment.find(commentIds[0]);
      const posts = await comment1.post().count();
      expect(posts).toBe(0);

      const posts2 = await comment1.post().withTrashed().count();
      expect(posts2).toBe(1);
    });
  });
});
