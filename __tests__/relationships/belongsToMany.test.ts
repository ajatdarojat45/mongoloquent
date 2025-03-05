import { ObjectId } from "mongodb";
import Model from "../../src/Model";

class User extends Model {
  static $collection = "users";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  static roles() {
    return this.belongsToMany(Role, RoleUser, "userId", "roleId");
  }
}

class Role extends Model {
  static $collection = "roles";
  static $useSoftDelete = true;
  static $useTimestamps = true;

  static users() {
    return this.belongsToMany(User, RoleUser, "roleId", "userId");
  }
}

class RoleUser extends Model {
  static $collection = "role_user";
  static $useSoftDelete = true;
  static $useTimestamps = true;
}

let userIds: ObjectId[];
let roleIds: ObjectId[];

beforeAll(async () => {
  userIds = await User.insertMany([
    { name: "Udin", age: 10, IS_DELETED: false },
    { name: "Kosasih", age: 11, IS_DELETED: false },
    { name: "Jhon", age: 12, IS_DELETED: false },
  ]);

  roleIds = await Role.insertMany([
    { name: "Role 1", type: "Full", IS_DELETED: false },
    { name: "Role 2", type: "Half", IS_DELETED: false },
    { name: "Role 3", type: "Empty", IS_DELETED: false },
    { name: "Role 4", type: "Empty", IS_DELETED: false },
    { name: "Role 5", type: "Empty", IS_DELETED: false },
  ]);

  const udin = await User.find(userIds[0]);
  await udin.roles().attach([roleIds[0], roleIds[1], roleIds[2]]);

  const kosasih = await User.find(userIds[1]);
  await kosasih.roles().attach([roleIds[0], roleIds[1]]);
});

afterAll(async () => {
  const userCollection = User["getCollection"]();
  const roleCollection = Role["getCollection"]();
  const roleUserCollection = RoleUser["getCollection"]();

  await userCollection.deleteMany({});
  await roleCollection.deleteMany({});
  await roleUserCollection.deleteMany({});
});

describe("belongsToMany Relation", () => {
  it("Should return related data", async () => {
    const user = await User.with("roles").where("_id", userIds[0]).first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("roles");

    const roles = user?.roles;
    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(3);

    const role = roles[0];
    expect(role).toEqual(expect.any(Object));
  });

  it("Should return related data - reverse", async () => {
    const role = await Role.with("users").where("_id", roleIds[0]).first();
    expect(role).toEqual(expect.any(Object));
    expect(role).toHaveProperty("users");

    const users = role?.users;
    expect(users).toEqual(expect.any(Array));
    expect(users).toHaveLength(2);

    const user = users[0];
    expect(user).toEqual(expect.any(Object));
  });

  it("With selected fields", async () => {
    const user = await User.with("roles", {
      select: ["name"],
    })
      .where("_id", userIds[0])
      .first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("roles");

    const roles = user?.roles;
    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(3);

    const role = roles[0];
    expect(role).toEqual(expect.any(Object));
    expect(role).toHaveProperty("name");
    expect(role).not.toHaveProperty("type");
    expect(role).not.toHaveProperty("_id");
  });

  it("With exclude fields", async () => {
    const user = await User.with("roles", {
      exclude: ["name"],
    })
      .where("_id", userIds[0])
      .first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("roles");

    const roles = user?.roles;
    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(3);

    const role = roles[0];
    expect(role).toEqual(expect.any(Object));
    expect(role).not.toHaveProperty("name");
    expect(role).toHaveProperty("type");
    expect(role).toHaveProperty("_id");
  });

  it("With has no data", async () => {
    const user = await User.with("roles").where("_id", userIds[2]).first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("roles");

    const roles = user?.roles;
    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(0);
  });

  it("Querying related data", async () => {
    const user = await User.find(userIds[0]);
    const roles = await user.roles().where("name", "Role 1").get();

    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(1);
  });

  it("With softDelete", async () => {
    await Role.destroy(roleIds[0]);
    const user = await User.with("roles").where("_id", userIds[0]).first();
    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("roles");

    const roles = user?.roles;
    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(2);

    const _roles = await Role.withTrashed().get();
    expect(_roles).toEqual(expect.any(Array));
    expect(_roles).toHaveLength(5);
  });

  it("With attach method", async () => {
    await User.find(userIds[0]).roles().attach(roleIds[3]);

    const roles = await User.find(userIds[0]).roles().get();

    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(3);
  });

  it("With detach method", async () => {
    await User.find(userIds[0]).roles().detach([roleIds[1], roleIds[2]]);
    const roles = await User.find(userIds[0]).roles().get();
    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(3);
  });

  it("With sync method", async () => {
    await User.find(userIds[0]).roles().sync([roleIds[1], roleIds[2]]);

    const roles = await User.find(userIds[0]).roles().get();

    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(2);
  });
});
