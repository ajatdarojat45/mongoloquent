import { ObjectId } from "mongodb";
import Model from "../../src/database/Model";

class Post extends Model {
  static collection = "posts";
  static softDelete = true;
  static timestamps = true;

  static image() {
    return this.morphTo(Image, "imageable");
  }
}

class User extends Model {
  static collection = "users";
  static softDelete = true;
  static timestamps = true;

  static image() {
    return this.morphTo(Image, "imageable");
  }
}

class Image extends Model {
  static collection = "imageables";
  static softDelete = true;
  static timestamps = true;
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

  const user: any = await User.find(userIds[0]);
  await user.image().save({
    url: "image1.jpg",
  });

  const post: any = await Post.find(postIds[0]);
  await post.image().save({
    url: "image2.jpg",
  });
});

afterAll(async () => {
  const userCollection = User["getCollection"]();
  const postCollection = Post["getCollection"]();
  const imageCollection = Image["getCollection"]();

  await userCollection.deleteMany({});
  await postCollection.deleteMany({});
  await imageCollection.deleteMany({});
});

describe("morphTo Relation", () => {
  it("Should return related data", async () => {
    const { data: user }: any = await User.with("image").find(userIds[0]);

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("image");

    const { image } = user;

    expect(image).toEqual(expect.any(Object));
    expect(image).toHaveProperty("url");
    expect(image).toHaveProperty("imageableId", userIds[0]);
    expect(image).toHaveProperty("imageableType", User.name);
  });

  it("Should return related data from another model", async () => {
    const { data: post }: any = await Post.with("image").find(postIds[0]);

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("image");

    const { image } = post;

    expect(image).toEqual(expect.any(Object));
    expect(image).toHaveProperty("url");
    expect(image).toHaveProperty("imageableId", postIds[0]);
    expect(image).toHaveProperty("imageableType", Post.name);
  });

  it("With selected fields", async () => {
    const { data: user }: any = await User.with("image", {
      select: ["url"],
    }).find(userIds[0]);

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("image");

    const { image } = user;

    expect(image).toEqual(expect.any(Object));
    expect(image).toHaveProperty("url");
    expect(image).not.toHaveProperty("_id");
    expect(image).not.toHaveProperty("imageableId");
    expect(image).not.toHaveProperty("imageableType");
  });

  it("With excluded fields", async () => {
    const { data: user }: any = await User.with("image", {
      exclude: ["url"],
    }).find(userIds[0]);

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("image");

    const { image } = user;

    expect(image).toEqual(expect.any(Object));
    expect(image).not.toHaveProperty("url");
    expect(image).toHaveProperty("_id");
    expect(image).toHaveProperty("imageableId");
    expect(image).toHaveProperty("imageableType");
  });

  it("With has no data", async () => {
    const { data: post }: any = await Post.with("image").find(postIds[1]);

    expect(post).toEqual(expect.any(Object));
    expect(post).not.toHaveProperty("image");
  });

  it("With softDelete", async () => {
    await Image.where("url", "image1.jpg").delete();

    const { data: user }: any = await User.with("image").find(userIds[0]);

    expect(user).toEqual(expect.any(Object));
    expect(user).not.toHaveProperty("image");

    const images = await Image.withTrashed().get();
    expect(images).toEqual(expect.any(Array));
    expect(images).toHaveLength(2);
  });
});
