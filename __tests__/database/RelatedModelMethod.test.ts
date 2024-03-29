import Model from "../../src/database/Model";

class User extends Model {
  static collection = "users";
  static softDelete = true;
  static timestamps = true;

  static roles() {
    return this.belongsToMany(Role, RoleUser, "userId", "roleId");
  }
}

class RoleUser extends Model {
  static collection = "roleuser";
}

class Role extends Model {
  static collection = "roles";
  static softDelete = true;
  static timestamps = true;
}

class Post extends Model {
  static collection = "posts";
  static softDelete = true;
  static timestamps = true;

  static tags() {
    return this.morphToMany(Tag, "taggable");
  }
}

class Tag extends Model {
  static collection = "tags";
  static sofDelete = true;
  static timestamps = true;

  static posts() {
    return this.morphedByMany(Post, "taggable");
  }
}

beforeAll(async () => {
  await User.insertMany([
    { name: "Udin" },
    { name: "Kosasih" },
    { name: "John" },
  ]);

  await Role.insertMany([
    { name: "Role 1" },
    { name: "Role 2" },
    { name: "Role 3" },
  ]);

  await Post.insertMany([
    { name: "Post 1" },
    { name: "Post 2" },
    { name: "Post 3" },
  ]);

  await Tag.insertMany([
    { name: "Tag 1" },
    { name: "Tag 2" },
    { name: "Tag 3" },
  ]);
});

class Taggable extends Model {
  static collection = "taggables";
}

afterAll(async () => {
  const userCollection = User["getCollection"]();
  const roleCollection = Role["getCollection"]();
  const roleUserCollection = RoleUser["getCollection"]();
  const postCollection = Post["getCollection"]();
  const tagCollection = Tag["getCollection"]();
  const taggableCollection = Taggable["getCollection"]();

  await userCollection.deleteMany({});
  await roleCollection.deleteMany({});
  await roleUserCollection.deleteMany({});
  await postCollection.deleteMany({});
  await tagCollection.deleteMany({});
  await taggableCollection.deleteMany({});
});

describe("attach method", () => {
  it("for many to many polymorphic relation", async () => {
    const post: any = await Post.where("name", "Post 1").first();

    const tagIds = await Tag.pluck("_id");

    await post.tags().attach(tagIds);

    const { data: result }: any = await Post.with("tags").find(post.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("tags");
    expect(result.tags).toEqual(expect.any(Array));
    expect(result.tags).toHaveLength(3);
    expect(result.tags[0]).toEqual(expect.any(Object));
  });

  it("for many to many relation", async () => {
    const user: any = await User.where("name", "Udin").first();

    const roleIds = await Role.pluck("_id");

    await user.roles().attach(roleIds);

    const { data: result }: any = await User.with("roles").find(user.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("roles");
    expect(result.roles).toEqual(expect.any(Array));
    expect(result.roles).toHaveLength(3);
    expect(result.roles[0]).toEqual(expect.any(Object));
  });
});

describe("detach method", () => {
  it("for many to many relation", async () => {
    const user: any = await User.where("name", "Udin").first();

    const roleIds = await Role.pluck("_id");

    await user.roles().detach([roleIds[0], roleIds[1]]);

    const { data: result }: any = await User.with("roles").find(user.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("roles");
    expect(result.roles).toEqual(expect.any(Array));
    expect(result.roles).toHaveLength(1);
    expect(result.roles[0]).toEqual(expect.any(Object));
  });

  it("for many to many polymorphic relation", async () => {
    const post: any = await Post.where("name", "Post 1").first();

    const tagIds = await Tag.pluck("_id");

    await post.tags().detach([tagIds[0], tagIds[1]]);

    const { data: result }: any = await Post.with("tags").find(post.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("tags");
    expect(result.tags).toEqual(expect.any(Array));
    expect(result.tags).toHaveLength(1);
    expect(result.tags[0]).toEqual(expect.any(Object));
  });
});

describe("sync method", () => {
  it("for many to many relation", async () => {
    const user: any = await User.where("name", "Udin").first();

    const roleIds = await Role.pluck("_id");

    await user.roles().sync([roleIds[1], roleIds[2]]);

    const { data: result }: any = await User.with("roles").find(user.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("roles");
    expect(result.roles).toEqual(expect.any(Array));
    expect(result.roles).toHaveLength(2);
    expect(result.roles[0]).toEqual(expect.any(Object));
  });

  it("for many to many polymorphic relation", async () => {
    const post: any = await Post.where("name", "Post 1").first();

    const tagIds = await Tag.pluck("_id");

    console.log(tagIds);
    await post.tags().sync([tagIds[1], tagIds[2]]);

    const { data: result }: any = await Post.with("tags").find(post.data._id);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("tags");
    expect(result.tags).toEqual(expect.any(Array));
    expect(result.tags).toHaveLength(2);
    expect(result.tags[0]).toEqual(expect.any(Object));
  });
});
