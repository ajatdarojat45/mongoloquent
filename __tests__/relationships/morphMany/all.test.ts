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

describe("all method", () => {
  it("should return all doc", async () => {
    interface IPost extends IMongoloquentSchema {
      title: string;
      content: string;
      comments?: Comment[];
    }

    interface IComment extends IMongoloquentSoftDelete {
      content: string;
      active: boolean;
    }

    class Post extends Model<IPost> {
      protected $collection = "posts";
      static $schema: Post;

      comments() {
        return this.morphMany(Comment, "commentable");
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
    await post.comments().createMany([
      { content: "Comment 1", active: true },
      { content: "Comment 2", active: true },
    ]);

    const post2 = await Post.find(postsIds[1]);
    await post2.comments().createMany([
      { content: "Comment 1", active: true },
      { content: "Comment 2", active: true },
    ]);

    const comments = await post.comments().all();
    expect(comments).toEqual(expect.any(Array));
    expect(comments).toHaveLength(2);
    expect(comments[0]).toEqual(expect.any(Object));
    expect(comments[0]).toHaveProperty("_id");
    expect(comments[0]).toHaveProperty("content", "Comment 1");
    expect(comments[0]).toHaveProperty("active", true);
    expect(comments[0]).toHaveProperty("commentableId", post._id);
    expect(comments[0]).toHaveProperty("commentableType", Post.name);
  });
});
