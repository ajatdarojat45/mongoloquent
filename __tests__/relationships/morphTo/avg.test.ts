import Model from "../../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../../src/interfaces/ISchema";

describe("avg method", () => {
  describe("without soft delete", () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      body: string;
      likes: number;
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
        { title: "Post 1", body: "Post 1 body", likes: 1 },
        { title: "Post 2", body: "Post 2 body", likes: 2 },
        { title: "Post 3", body: "Post 3 body", likes: 3 },
      ]);

      const post1 = await Post.find(postIds[0]);
      const commentIds = await post1.comments().saveMany([
        { body: "Comment 1", url: "url1" },
        { body: "Comment 2", url: "url2" },
      ]);

      const comment1 = await Comment.find(commentIds[0]);
      const posts = await comment1.post().avg("likes");
      expect(posts).toBe(1);
    });
  });

  describe("with soft delete", () => {
    interface IPost extends IMongoloquentSchema, IMongoloquentSoftDelete {
      title: string;
      body: string;
      likes: number;
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
        { title: "Post 1", body: "Post 1 body", likes: 1 },
        { title: "Post 2", body: "Post 2 body", likes: 2 },
        { title: "Post 3", body: "Post 3 body", likes: 3 },
      ]);

      const post1 = await Post.find(postIds[0]);
      const commentIds = await post1.comments().saveMany([
        { body: "Comment 1", url: "url1" },
        { body: "Comment 2", url: "url2" },
      ]);

      await Post.destroy(postIds[0]);

      const comment1 = await Comment.find(commentIds[0]);
      const posts = await comment1.post().avg("likes");
      expect(posts).toBe(0);

      const posts2 = await comment1.post().withTrashed().avg("likes");
      expect(posts2).toBe(1);
    });
  });
});
