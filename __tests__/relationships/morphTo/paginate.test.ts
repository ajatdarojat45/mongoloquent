import Model from "../../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../../src/interfaces/ISchema";

describe("paginate method", () => {
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
      const post = await comment1.post().paginate();
      expect(post).toEqual(expect.any(Object));
      expect(post).toHaveProperty("data");
      expect(post).toHaveProperty("meta");
      expect(post.data.length).toBe(1);
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
      const posts = await comment1.post().paginate();
      expect(posts).toEqual(expect.any(Object));
      expect(posts).toHaveProperty("data");
      expect(posts).toHaveProperty("meta");
      expect(posts.data.length).toBe(0);
    });
  });
});
