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

describe("saveMany method", () => {
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
      static $collection = "posts";
      static $schema: Post;

      comments() {
        return this.hasMany(Comment, "postId", "_id");
      }
    }

    class Comment extends Model<IComment> {
      static $collection = "comments";
      static $useTimestamps = false;
      static $schema: Comment;
    }

    const postsIds = await Post.insertMany([
      { title: "Post 1", content: "Content 1" },
      { title: "Post 2", content: "Content 2" },
    ]);

    const post = await Post.find(postsIds[0]);

    const comment = await await post.comments().saveMany([
      { content: "Comment 1", active: true },
      { content: "Comment 2", active: true },
    ]);

    expect(comment).toEqual(expect.any(Array));
    expect(comment).toHaveLength(2);

    const post2 = await Post.with("comments").where("_id", post._id).first();
    expect(post2).toEqual(expect.any(Object));
    expect(post2).toHaveProperty("comments");
    expect(post2?.comments).toEqual(expect.any(Array));
    expect(post2?.comments).toHaveLength(2);
  });
});
