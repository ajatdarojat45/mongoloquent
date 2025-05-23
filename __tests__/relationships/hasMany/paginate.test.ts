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

describe("paginate method", () => {
  it("without parameters", async () => {
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
      { postId: postsIds[0], content: "Comment 1", active: true },
      { postId: postsIds[0], content: "Comment 2", active: true },
      { postId: postsIds[1], content: "Comment 3", active: true },
    ]);

    const post = await Post.find(postsIds[0]);

    const comments = await post.comments().paginate();
    expect(comments).toEqual(expect.any(Object));
    expect(comments).toHaveProperty("data");
    expect(comments.data).toEqual(expect.any(Array));
    expect(comments.data).toHaveLength(2);

    expect(comments).toHaveProperty("meta");
    expect(comments.meta).toEqual(expect.any(Object));
    expect(comments.meta).toHaveProperty("total", 2);
    expect(comments.meta).toHaveProperty("page", 1);
    expect(comments.meta).toHaveProperty("lastPage", 1);
    expect(comments.meta).toHaveProperty("limit", 15);
  });

  it("with parameters", async () => {
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
      static $collection = "posts";
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
      { postId: postsIds[0], content: "Comment 1", active: true },
      { postId: postsIds[0], content: "Comment 2", active: true },
      { postId: postsIds[1], content: "Comment 3", active: true },
    ]);

    const post = await Post.find(postsIds[0]);

    const comments = await post.comments().paginate(2, 1);
    expect(comments).toEqual(expect.any(Object));
    expect(comments).toHaveProperty("data");
    expect(comments.data).toEqual(expect.any(Array));
    expect(comments.data).toHaveLength(1);

    expect(comments).toHaveProperty("meta");
    expect(comments.meta).toEqual(expect.any(Object));
    expect(comments.meta).toHaveProperty("total", 2);
    expect(comments.meta).toHaveProperty("page", 2);
    expect(comments.meta).toHaveProperty("lastPage", 2);
    expect(comments.meta).toHaveProperty("limit", 1);
  });
});
