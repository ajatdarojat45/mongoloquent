import Model from "../../src/database/Model";

class Country extends Model {
  static collection = "countries";

  static users() {
    return this.hasMany(User, "countryId", "_id");
  }

  static users2() {
    return this.hasMany("users", "countryId", "_id");
  }

  static posts() {
    return this.hasManyThrough(Post, User, "countryId", "userId");
  }

  static posts2() {
    return this.hasManyThrough("posts", "users", "countryId", "userId");
  }
}

class User extends Model {
  static collection = "users";

  static country() {
    return this.belongsTo(Country, "countryId", "_id");
  }

  static posts() {
    return this.hasMany(Post, "userId", "id");
  }

  static roles() {
    return this.belongsToMany(Role, RoleUser, "userId", "roleId");
  }

  static roles2() {
    return this.belongsToMany("roles", "roleUser", "userId", "roleId");
  }
}

class Post extends Model {
  static collection = "posts";

  static user() {
    return this.belongsTo(User, "userId", "_id");
  }

  static user2() {
    return this.belongsTo("users", "userId", "_id");
  }
}

class Role extends Model {
  static collection = "roles";

  static users() {
    return this.belongsToMany(User, RoleUser, "role_id", "user_id");
  }
}

class RoleUser extends Model {
  static collection = "roleUser";
}

const countries = [
  { name: "Indonesia", isDeleted: false },
  { name: "Thailand", isDeleted: false },
  { name: "Malaysia", isDeleted: true },
];

beforeAll(async () => {
  const countryCollection = Country["getCollection"]();
  const userCollection = User["getCollection"]();
  const postCollection = Post["getCollection"]();
  const roleCollection = Role["getCollection"]();
  const roleUserCollection = RoleUser["getCollection"]();

  // delete all data
  await countryCollection.deleteMany({});
  await userCollection.deleteMany({});
  await postCollection.deleteMany({});
  await roleCollection.deleteMany({});
  await roleUserCollection.deleteMany({});

  const { insertedIds: countryIds } = await countryCollection.insertMany(
    countries
  );

  const users = [
    { name: "Udin", countryId: countryIds[0], isDeleted: false },
    { name: "Ujang", countryId: countryIds[0], isDeleted: false },
    { name: "Ucok", countryId: countryIds[0], isDeleted: true },
    {
      name: "kosasih",
      countryId: countryIds[1],
      isDeleted: false,
    },
  ];

  const { insertedIds: userIds } = await userCollection.insertMany(users);

  const posts = [
    { title: "Post 1", userId: userIds[0], isDeleted: false },
    { title: "Post 2", userId: userIds[0], isDeleted: false },
    { title: "Post 3", userId: userIds[1], isDeleted: false },
    { title: "Post 4", userId: userIds[2], isDeleted: true },
    { title: "Post 5", userId: userIds[3], isDeleted: false },
  ];

  await postCollection.insertMany(posts);

  const roles = [
    { name: "Admin", isDeleted: false },
    { name: "Staff", isDeleted: false },
  ];

  const { insertedIds: roleIds } = await roleCollection.insertMany(roles);

  const roleUser = [
    { userId: userIds[0], roleId: roleIds[0], isDeleted: false },
    { userId: userIds[0], roleId: roleIds[1], isDeleted: true },
    { userId: userIds[1], roleId: roleIds[1], isDeleted: false },
  ];

  await roleUserCollection.insertMany(roleUser);
});

describe("RelationResult - hasMany method", () => {
  it("should return all related data", async () => {
    const country = await Country.with("users")
      .where("name", "Indonesia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("users");
    expect((country as any).users).toHaveLength(3);
    expect((country as any).users[0]).toEqual(expect.any(Object));
    expect((country as any).users[0]).toHaveProperty("_id");
    expect((country as any).users[0]).toHaveProperty("name");
    expect((country as any).users[0]).toHaveProperty("countryId");
    expect((country as any).users[0]).toHaveProperty("isDeleted");
  });

  it("with collection name should return all related data", async () => {
    const country = await Country.with("users2")
      .where("name", "Indonesia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("users2");
    expect((country as any).users2).toHaveLength(3);
    expect((country as any).users2[0]).toEqual(expect.any(Object));
    expect((country as any).users2[0]).toHaveProperty("_id");
    expect((country as any).users2[0]).toHaveProperty("name");
    expect((country as any).users2[0]).toHaveProperty("countryId");
    expect((country as any).users2[0]).toHaveProperty("isDeleted");
  });

  it("with soft delete", async () => {
    User["softDelete"] = true;

    const country = await Country.with("users")
      .where("name", "Indonesia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("users");
    expect((country as any).users).toHaveLength(2);
    expect((country as any).users[0]).toEqual(expect.any(Object));
    expect((country as any).users[0]).toHaveProperty("_id");
    expect((country as any).users[0]).toHaveProperty("name");
    expect((country as any).users[0]).toHaveProperty("countryId");
    expect((country as any).users[0]).toHaveProperty("isDeleted");
  });

  it("with select column", async () => {
    User["softDelete"] = true;
    const country = await Country.with("users", {
      select: ["name"],
    })
      .where("name", "Indonesia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("users");
    expect((country as any).users).toHaveLength(2);
    expect((country as any).users[0]).toEqual(expect.any(Object));
    expect((country as any).users[0]).toHaveProperty("name");
    expect((country as any).users[0]).not.toHaveProperty("_id");
    expect((country as any).users[0]).not.toHaveProperty("countryId");
    expect((country as any).users[0]).not.toHaveProperty("isDeleted");
  });

  it("with exclude column", async () => {
    User["softDelete"] = true;
    const country = await Country.with("users", {
      exclude: ["name"],
    })
      .where("name", "Indonesia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("users");
    expect((country as any).users).toHaveLength(2);
    expect((country as any).users[0]).toEqual(expect.any(Object));
    expect((country as any).users[0]).not.toHaveProperty("name");
    expect((country as any).users[0]).toHaveProperty("_id");
    expect((country as any).users[0]).toHaveProperty("countryId");
    expect((country as any).users[0]).toHaveProperty("isDeleted");
  });

  it("with have no related data", async () => {
    const country = await Country.with("users")
      .where("name", "Malaysia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("users");
    expect((country as any).users).toHaveLength(0);
  });
});

describe("RelationResult - belongsTo method", () => {
  it("should return related data", async () => {
    const post = await Post.has("user").where("title", "Post 2").first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("user");
    expect((post as any).user).toEqual(expect.any(Object));
    expect((post as any).user).toHaveProperty("_id");
    expect((post as any).user).toHaveProperty("name");
    expect((post as any).user).toHaveProperty("countryId");
    expect((post as any).user).toHaveProperty("isDeleted");
  });

  it("with collection name should return related data", async () => {
    const post = await Post.has("user2").where("title", "Post 2").first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("user2");
    expect((post as any).user2).toEqual(expect.any(Object));
    expect((post as any).user2).toHaveProperty("_id");
    expect((post as any).user2).toHaveProperty("name");
    expect((post as any).user2).toHaveProperty("countryId");
    expect((post as any).user2).toHaveProperty("isDeleted");
  });

  it("with this.fields > 0", async () => {
    const post = await Post.has("user", {
      select: ["name"],
    })
      .where("title", "Post 2")
      .select(["title", "userId"])
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("title", "Post 2");
    expect(post).toHaveProperty("userId");
    expect(post).toHaveProperty("user");
    expect((post as any).user).toHaveProperty("name");
    expect((post as any).user).not.toHaveProperty("_id");
    expect((post as any).user).not.toHaveProperty("countryId");
  });

  it("with select column", async () => {
    const post = await Post.has("user", {
      select: ["name"],
    })
      .where("title", "Post 2")
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("user");
    expect((post as any).user).toEqual(expect.any(Object));
    expect((post as any).user).toHaveProperty("name");
    expect((post as any).user).not.toHaveProperty("_id");
    expect((post as any).user).not.toHaveProperty("countryId");
    expect((post as any).user).not.toHaveProperty("isDeleted");
  });

  it("with exclude column", async () => {
    const post = await Post.has("user", {
      exclude: ["name"],
    })
      .where("title", "Post 2")
      .first();

    expect(post).toEqual(expect.any(Object));
    expect(post).toHaveProperty("user");
    expect((post as any).user).toEqual(expect.any(Object));
    expect((post as any).user).not.toHaveProperty("name");
    expect((post as any).user).toHaveProperty("_id");
    expect((post as any).user).toHaveProperty("countryId");
    expect((post as any).user).toHaveProperty("isDeleted");
  });

  it("with soft delete and not exist relation data", async () => {
    User["softDelete"] = true;

    const post = await Post.has("user").where("title", "Post 4").first();

    expect(post).toEqual(expect.any(Object));
    expect(post).not.toHaveProperty("user");
  });
});

describe("RelationResult - hasManyThrough method", () => {
  it("should return related data", async () => {
    const country = await Country.with("posts")
      .where("name", "Indonesia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("_id");
    expect(country).toHaveProperty("name");
    expect(country).toHaveProperty("isDeleted");
    expect(country).toHaveProperty("posts");
    expect((country as any).posts).toHaveLength(4);
    expect((country as any).posts[0]).toEqual(expect.any(Object));
    expect((country as any).posts[0]).toHaveProperty("_id");
    expect((country as any).posts[0]).toHaveProperty("title");
    expect((country as any).posts[0]).toHaveProperty("userId");
    expect((country as any).posts[0]).toHaveProperty("isDeleted");
  });

  it("with collection name should return related data", async () => {
    const country = await Country.with("posts2")
      .where("name", "Indonesia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("_id");
    expect(country).toHaveProperty("name");
    expect(country).toHaveProperty("isDeleted");
    expect(country).toHaveProperty("posts2");
    expect((country as any).posts2).toHaveLength(4);
    expect((country as any).posts2[0]).toEqual(expect.any(Object));
    expect((country as any).posts2[0]).toHaveProperty("_id");
    expect((country as any).posts2[0]).toHaveProperty("title");
    expect((country as any).posts2[0]).toHaveProperty("userId");
    expect((country as any).posts2[0]).toHaveProperty("isDeleted");
  });

  it("with this.fields > 0", async () => {
    const country = await Country.with("posts")
      .where("name", "Indonesia")
      .select(["name"])
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("name", "Indonesia");
    expect(country).toHaveProperty("_id");
    expect(country).not.toHaveProperty("isDeleted");
    expect(country).toHaveProperty("posts");
    expect((country as any).posts).toHaveLength(4);
    expect((country as any).posts[0]).toEqual(expect.any(Object));
    expect((country as any).posts[0]).toHaveProperty("title");
    expect((country as any).posts[0]).toHaveProperty("_id");
    expect((country as any).posts[0]).toHaveProperty("userId");
  });

  it("with select column", async () => {
    const country = await Country.with("posts", {
      select: ["title"],
    })
      .where("name", "Indonesia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("_id");
    expect(country).toHaveProperty("name");
    expect(country).toHaveProperty("isDeleted");
    expect(country).toHaveProperty("posts");
    expect((country as any).posts).toHaveLength(4);
    expect((country as any).posts[0]).toEqual(expect.any(Object));
    expect((country as any).posts[0]).toHaveProperty("title");
    expect((country as any).posts[0]).not.toHaveProperty("_id");
    expect((country as any).posts[0]).not.toHaveProperty("userId");
  });

  it("with exclude column", async () => {
    const country = await Country.with("posts", {
      exclude: ["title"],
    })
      .where("name", "Indonesia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("_id");
    expect(country).toHaveProperty("name");
    expect(country).toHaveProperty("isDeleted");
    expect(country).toHaveProperty("posts");
    expect((country as any).posts).toHaveLength(4);
    expect((country as any).posts[0]).toEqual(expect.any(Object));
    expect((country as any).posts[0]).not.toHaveProperty("title");
    expect((country as any).posts[0]).toHaveProperty("_id");
    expect((country as any).posts[0]).toHaveProperty("userId");
  });

  it("with soft delete", async () => {
    Post["softDelete"] = true;

    const country = await Country.with("posts")
      .where("name", "Indonesia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("_id");
    expect(country).toHaveProperty("name");
    expect(country).toHaveProperty("isDeleted");
    expect(country).toHaveProperty("posts");
    expect((country as any).posts).toHaveLength(3);
    expect((country as any).posts[0]).toEqual(expect.any(Object));
    expect((country as any).posts[0]).toHaveProperty("_id");
    expect((country as any).posts[0]).toHaveProperty("title");
    expect((country as any).posts[0]).toHaveProperty("userId");
    expect((country as any).posts[0]).toHaveProperty("isDeleted");
  });

  it("with not exist relation data", async () => {
    const country = await Country.with("posts")
      .where("name", "Malaysia")
      .first();

    expect(country).toEqual(expect.any(Object));
    expect(country).toHaveProperty("_id");
    expect(country).toHaveProperty("name");
    expect(country).toHaveProperty("isDeleted");
    expect(country).toHaveProperty("posts");
    expect((country as any).posts).toHaveLength(0);
  });
});

describe("RelationResult - belongsToMany method", () => {
  it("should return related data", async () => {
    const user = await User.with("roles").where("name", "Udin").first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("isDeleted");
    expect(user).toHaveProperty("countryId");
    expect(user).toHaveProperty("roles");
    expect((user as any).roles).toHaveLength(2);
    expect((user as any).roles[0]).toEqual(expect.any(Object));
    expect((user as any).roles[0]).toHaveProperty("_id");
    expect((user as any).roles[0]).toHaveProperty("name");
    expect((user as any).roles[0]).toHaveProperty("isDeleted");
  });

  it("with collection name should return related data", async () => {
    const user = await User.with("roles2").where("name", "Udin").first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("isDeleted");
    expect(user).toHaveProperty("countryId");
    expect(user).toHaveProperty("roles2");
    expect((user as any).roles2).toHaveLength(2);
    expect((user as any).roles2[0]).toEqual(expect.any(Object));
    expect((user as any).roles2[0]).toHaveProperty("_id");
    expect((user as any).roles2[0]).toHaveProperty("name");
    expect((user as any).roles2[0]).toHaveProperty("isDeleted");
  });

  it("with this.fields > 0", async () => {
    const user = await User.with("roles")
      .where("name", "Udin")
      .select(["name"])
      .first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("name", "Udin");
    expect(user).toHaveProperty("_id");
    expect(user).not.toHaveProperty("isDeleted");
    expect(user).toHaveProperty("roles");
    expect((user as any).roles).toHaveLength(2);
    expect((user as any).roles[0]).toEqual(expect.any(Object));
    expect((user as any).roles[0]).toHaveProperty("name");
    expect((user as any).roles[0]).toHaveProperty("_id");
  });

  it("with select column", async () => {
    const user = await User.select("name")
      .with("roles", {
        select: ["name"],
      })
      .where("name", "Udin")
      .first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("name");
    expect(user).not.toHaveProperty("isDeleted");
    expect(user).toHaveProperty("roles");
    expect((user as any).roles).toHaveLength(2);
    expect((user as any).roles[0]).toEqual(expect.any(Object));
    expect((user as any).roles[0]).toHaveProperty("name");
    expect((user as any).roles[0]).not.toHaveProperty("_id");
    expect((user as any).roles[0]).not.toHaveProperty("isDeleted");
  });

  it("with exclude column", async () => {
    const user = await User.with("roles", {
      exclude: ["name"],
    })
      .where("name", "Udin")
      .first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("isDeleted");
    expect(user).toHaveProperty("roles");
    expect((user as any).roles).toHaveLength(2);
    expect((user as any).roles[0]).toEqual(expect.any(Object));
    expect((user as any).roles[0]).not.toHaveProperty("name");
    expect((user as any).roles[0]).toHaveProperty("_id");
    expect((user as any).roles[0]).toHaveProperty("isDeleted");
  });

  it("with soft delete", async () => {
    Role["softDelete"] = true;

    const user = await User.with("roles").where("name", "Udin").first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("isDeleted");
    expect(user).toHaveProperty("countryId");
    expect(user).toHaveProperty("roles");
    expect((user as any).roles).toHaveLength(1);
    expect((user as any).roles[0]).toEqual(expect.any(Object));
    expect((user as any).roles[0]).toHaveProperty("_id");
    expect((user as any).roles[0]).toHaveProperty("name");
    expect((user as any).roles[0]).toHaveProperty("isDeleted");
  });

  it("with not exist relation data", async () => {
    const user = await User.withTrashed()
      .with("roles")
      .where("name", "Ucok")
      .first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("isDeleted");
    expect(user).toHaveProperty("countryId");
    expect(user).toHaveProperty("roles");
    expect((user as any).roles).toHaveLength(0);
  });
});
