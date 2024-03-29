import Model from "../../src/database/Model";

class User extends Model {
  static collection = "users";
  static softDelete = true;
  static timestamps = true;

  static image() {
    return this.morphTo(Image, "imageable");
  }

  static images() {
    return this.morphMany(Image, "imageable");
  }

  static tags() {
    return this.morphToMany(Tag, "taggable");
  }
}

class Image extends Model {
  static collection = "images";
  static softDelete = true;
}

class Tag extends Model {
  static collection = "tags";
  static softDelete = true;

  static users() {
    return this.morphedByMany(User, "taggable");
  }
}

beforeAll(async () => {
  const users = [{ name: "Udin" }, { name: "Kosasih" }, { name: "John" }];
  await User.insertMany(users);

  const tags = [
    { name: "Tag 1" },
    { name: "Tag 2" },
    { name: "Tag 3" },
    { name: "Tag 4" },
  ];
  await Tag.insertMany(tags);
});

afterAll(async () => {
  const userCollection = User["getCollection"]();
  const imageCollection = Image["getCollection"]();
  const tagCollection = Tag["getCollection"]();

  await userCollection.deleteMany({});
  await imageCollection.deleteMany({});
  await tagCollection.deleteMany({});
});

describe("RelationResult - morphTo method", () => {
  it("should return object with related data", async () => {
    const user: any = await User.where("name", "Udin").first();

    user.image().save({
      url: "image.jpg",
    });

    const { data: result }: any = await User.with("image").find(user.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("image");

    const image = result.image;
    expect(image).toEqual(expect.any(Object));
    expect(image).toHaveProperty("url");
    expect(image).toHaveProperty("imageableId", user.data._id);
    expect(image).toHaveProperty("imageableType", User.name);
  });

  it("should return object with no related data", async () => {
    const user: any = await User.where("name", "Kosasih").first();

    const { data: result }: any = await User.with("image").find(user.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).not.toHaveProperty("image");
  });
});

describe("RelationResult - morphMany method", () => {
  it("should return object with related data", async () => {
    const user: any = await User.where("name", "John").first();

    await user.image().insertMany([
      {
        url: "image1.jpg",
      },
      {
        url: "image2.jpg",
      },
    ]);

    const { data: result }: any = await User.with("images").find(user.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("images");
    expect(result.images).toHaveLength(2);

    const image = result.images[0];
    expect(image).toEqual(expect.any(Object));
    expect(image).toHaveProperty("url");
    expect(image).toHaveProperty("imageableId", user.data._id);
    expect(image).toHaveProperty("imageableType", User.name);
  });

  it("should return object with no related data", async () => {
    const user: any = await User.where("name", "Kosasih").first();

    const { data: result }: any = await User.with("images").find(user.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("images");
    expect(result.images).toEqual(expect.any(Array));
    expect(result.images).toHaveLength(0);
  });
});

describe("RelationResult - morphToMany method", () => {
  it("should return object with related data", async () => {
    const user: any = await User.where("name", "Udin").first();
    const tags = await Tag.limit(2).pluck("_id");

    await user.tags().attach(tags);

    const { data: result }: any = await User.with("tags").find(user.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("tags");
    expect(result.tags).toHaveLength(2);
    expect(result.tags[0]).toEqual(expect.any(Object));
  });

  it("should return object with no related data", async () => {
    const user: any = await User.where("name", "Kosasih").first();
    const { data: result }: any = await User.with("tags").find(user.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("tags");
    expect(result.tags).toEqual(expect.any(Array));
    expect(result.tags).toHaveLength(0);
  });
});

describe("RelationResult - morphedByMany method", () => {
  it("should return object with related data", async () => {
    const user: any = await User.where("name", "John").first();
    const tagIds = await Tag.limit(3).pluck("_id");

    await user.tags().attach(tagIds[2]);

    const { data: result }: any = await Tag.with("users")
      .where("name", "Tag 3")
      .first();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("users");
    expect(result.users).toEqual(expect.any(Array));
    expect(result.users).toHaveLength(1);
    expect(result.users[0]).toEqual(expect.any(Object));
  });

  it("should return object with no related data", async () => {
    const { data: result }: any = await Tag.with("users")
      .where("name", "Tag 4")
      .first();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("users");
    expect(result.users).toEqual(expect.any(Array));
    expect(result.users).toHaveLength(0);
  });
});
