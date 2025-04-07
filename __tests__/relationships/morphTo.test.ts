import { ObjectId } from "mongodb";

import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IPost extends IMongoloquentSchema {
  title: string;
}
interface IUser extends IMongoloquentSchema {
  name: string;
}
interface IImage extends IMongoloquentSchema {
  url: string;
  imageableId: ObjectId;
  imageableType: string;
}

class Post extends Model<IPost> {
  static $collection = "posts";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  image() {
    return this.morphTo(Image, "imageable");
  }
}

class User extends Model<IUser> {
  static $collection = "users";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  image() {
    return this.morphTo(Image, "imageable");
  }
}

class Image extends Model<IImage> {
  static $collection = "imageables";
  static $useSoftDelete = true;
  static $useTimestamps = true;
  static $schema: IImage;
}

let userIds: ObjectId[];
let postIds: ObjectId[];
let imageIds: ObjectId[];

beforeAll(async () => {
  userIds = await User.insertMany([
    { name: "Udin" },
    { name: "Kosasih" },
    { name: "Jhon" },
  ]);

  postIds = await Post.insertMany([
    { title: "Post 1" },
    { title: "Post 2" },
    { title: "Post 3" },
  ]);

  await Image.insertMany([
    { url: "image1.jpg", imageableId: userIds[0], imageableType: User.name },
    { url: "image2.jpg", imageableId: postIds[0], imageableType: Post.name },
  ]);
});

afterAll(async () => {
  await User.query()["getCollection"]().deleteMany({});
  await Post.query()["getCollection"]().deleteMany({});
  await Image.query()["getCollection"]().deleteMany({});
});

describe("morphTo Relation", () => {
  it("Should return related data", async () => {
    const user = await User.with("image").where("_id", userIds[0]).first();
    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("image");

    const image = user?.image;
    expect(image).toEqual(expect.any(Object));
    expect(image).toHaveProperty("url");
    expect(image).toHaveProperty("imageableId", userIds[0]);
    expect(image).toHaveProperty("imageableType", User.name);
  });

  it("Should return related data from another model", async () => {
    const post = await Post.with("image").where("_id", postIds[0]).first();
    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("image");

    const image = post?.image;
    expect(image).toEqual(expect.any(Object));
    expect(image).toHaveProperty("url");
    expect(image).toHaveProperty("imageableId", postIds[0]);
    expect(image).toHaveProperty("imageableType", Post.name);
  });

  it("With selected fields", async () => {
    const user = await User.with("image", {
      select: ["url"],
    })
      .where("_id", userIds[0])
      .first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("image");

    const image = user?.image;
    expect(image).toEqual(expect.any(Object));
    expect(image).toHaveProperty("url");
    expect(image).not.toHaveProperty("_id");
    expect(image).not.toHaveProperty("imageableId");
    expect(image).not.toHaveProperty("imageableType");
  });

  it("With excluded fields", async () => {
    const user = await User.with("image", {
      exclude: ["url"],
    })
      .where("_id", userIds[0])
      .first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("image");

    const image = user?.image;
    expect(image).toEqual(expect.any(Object));
    expect(image).not.toHaveProperty("url");
    expect(image).toHaveProperty("_id");
    expect(image).toHaveProperty("imageableId");
    expect(image).toHaveProperty("imageableType");
  });

  it("With add data from related model", async () => {
    const post = await Post.find(postIds[1]);
    await post.image().save({
      url: "newImage.jpg",
    });

    const post2 = await Post.with("image").where("_id", postIds[1]).first();
    expect(post2).toEqual(expect.any(Object));
    expect(post2).toHaveProperty("image");

    const image = post2?.image;
    expect(image).toEqual(expect.any(Object));
    expect(image).toHaveProperty("url", "newImage.jpg");
    expect(image).toHaveProperty("imageableId", postIds[1]);
    expect(image).toHaveProperty("imageableType", Post.name);
  });

  it("With has no data", async () => {
    const post = await Post.with("image").where("_id", postIds[2]).first();
    expect(post).toEqual(expect.any(Object));
    expect(post?.["$original"]).not.toHaveProperty("image");
  });

  it("With softDelete", async () => {
    await Image.where("url", "image1.jpg").delete();
    const user = await User.with("image").where("_id", userIds[0]).first();
    expect(user).toEqual(expect.any(Object));
    expect(user?.["$original"]).not.toHaveProperty("image");

    const images = await Image.withTrashed().get();
    expect(images).toEqual(expect.any(Array));
    expect(images).toHaveLength(3);
  });
});
