import { ObjectId } from "mongodb";

import DB from "../../../src/DB";
import Model from "../../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("posts").getCollection().deleteMany({});
  await DB.collection("comments").getCollection().deleteMany({});
});

afterEach(async () => {
  await DB.collection("posts").getCollection().deleteMany({});
  await DB.collection("comments").getCollection().deleteMany({});
});

describe("updateOrCreate method", () => {
  it("should create a new doc", async () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      content: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSoftDelete {
      postId: ObjectId;
      content: string;
      active: boolean;
    }

    class Post extends Model<IPost> {
      protected $collection = "posts";
      static $schema: Post;

      comments() {
        return this.hasMany(Comment, "postId", "_id");
      }
    }

    class Comment extends Model<IComment> {
      protected $collection = "comments";
      protected $useTimestamps = false;
      static $schema: Comment;
    }

    const postsIds = await Post.insertMany([
      { title: "Post 1", content: "Content 1" },
      { title: "Post 2", content: "Content 2" },
    ]);

    const post = await Post.find(postsIds[0]);

    const comment = await await post
      .comments()
      .updateOrCreate({ content: "Comment 1" }, { active: true });

    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("_id");
    expect(comment).toHaveProperty("content", "Comment 1");
    expect(comment).toHaveProperty("active", true);
    expect(comment).toHaveProperty("postId", post._id);

    const post2 = await Post.with("comments").where("_id", post._id).first();
    expect(post2).toEqual(expect.any(Object));
    expect(post2).toHaveProperty("comments");
    expect(post2?.comments).toEqual(expect.any(Array));
    expect(post2?.comments.length).toBe(1);
  });

  it("should update an existing doc", async () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      content: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSoftDelete {
      postId: ObjectId;
      content: string;
      active: boolean;
    }

    class Post extends Model<IPost> {
      protected $collection = "posts";
      static $schema: Post;

      comments() {
        return this.hasMany(Comment, "postId", "_id");
      }
    }

    class Comment extends Model<IComment> {
      protected $collection = "comments";
      protected $useTimestamps = false;
      static $schema: Comment;
    }

    const postsIds = await Post.insertMany([
      { title: "Post 1", content: "Content 1" },
      { title: "Post 2", content: "Content 2" },
    ]);

    await Comment.insertMany([
      { postId: postsIds[0], content: "Comment 1", active: false },
      { postId: postsIds[1], content: "Comment 2", active: false },
    ]);

    const post = await Post.find(postsIds[0]);
    const comment = await post
      .comments()
      .updateOrCreate({ active: false }, { content: "Comment 1 edited" });

    expect(comment).toEqual(expect.any(Object));
    expect(comment).toHaveProperty("_id");
    expect(comment).toHaveProperty("content", "Comment 1 edited");
    expect(comment).toHaveProperty("active", false);
    expect(comment).toHaveProperty("postId", post._id);

    const post2 = await Post.with("comments").where("_id", post._id).first();
    expect(post2).toEqual(expect.any(Object));
    expect(post2).toHaveProperty("comments");
    expect(post2?.comments).toEqual(expect.any(Array));
    expect(post2?.comments.length).toBe(1);

    // @ts-ignore
    const comment2 = post2?.comments?.[0];
    expect(comment2).toHaveProperty("content", "Comment 1 edited");
    expect(comment2).toHaveProperty("active", false);
  });
});
