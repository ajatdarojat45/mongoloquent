import { ObjectId } from "mongodb";
import Model from "../../src/database/Model";

class User extends Model {
  static collection = "users";
  static softDelete = true;
  static timestamps = true;

  static roles() {
    return this.belongsToMany(Role, RoleUser, "userId", "roleId");
  }
}

class Role extends Model {
  static collection = "roles";
  static softDelete = true;
  static timestamps = true;

  static users() {
    return this.belongsToMany(User, RoleUser, "roleId", "userId");
  }
}

class RoleUser extends Model {
  static collection = "roleUser";
  static softDelete = true;
  static timestamps = true;
}

let userIds: ObjectId[];
let roleIds: ObjectId[];

beforeAll(async () => {
  userIds = await User.insertMany([
    { name: "Udin", age: 10 },
    { name: "Kosasih", age: 11 },
    { name: "Jhon", age: 12 },
  ]);

  roleIds = await Role.insertMany([
    { name: "Role 1", type: "Full" },
    { name: "Role 2", type: "Half" },
    { name: "Role 3", type: "Empty" },
    { name: "Role 4", type: "Empty" },
    { name: "Role 5", type: "Empty" },
  ]);

  const udin: any = await User.find(userIds[0]);
  await udin.roles().attach([roleIds[0], roleIds[1], roleIds[2]]);

  const kosasih: any = await User.find(userIds[1]);
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
    const { data: user }: any = await User.with("roles").find(userIds[0]);

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("roles");

    const roles = user.roles;
    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(3);

    const role = roles[0];
    expect(role).toEqual(expect.any(Object));
  });

  it("Should return related data - reverse", async () => {
    const { data: role }: any = await Role.with("users").find(roleIds[0]);

    expect(role).toEqual(expect.any(Object));
    expect(role).toHaveProperty("users");

    const users = role.users;
    expect(users).toEqual(expect.any(Array));
    expect(users).toHaveLength(2);

    const user = users[0];
    expect(user).toEqual(expect.any(Object));
  });

  it("With selected fields", async () => {
    const { data: user }: any = await User.with("roles", {
      select: ["name"],
    }).find(userIds[0]);

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("roles");

    const roles = user.roles;
    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(3);

    const role = roles[0];
    expect(role).toEqual(expect.any(Object));
    expect(role).toHaveProperty("name");
    expect(role).not.toHaveProperty("type");
    expect(role).not.toHaveProperty("_id");
  });

  it("With exclude fields", async () => {
    const { data: user }: any = await User.with("roles", {
      exclude: ["name"],
    }).find(userIds[0]);

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("roles");

    const roles = user.roles;
    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(3);

    const role = roles[0];
    expect(role).toEqual(expect.any(Object));
    expect(role).not.toHaveProperty("name");
    expect(role).toHaveProperty("type");
    expect(role).toHaveProperty("_id");
  });

  it("With has no data", async () => {
    const { data: user }: any = await User.with("roles").find(userIds[2]);

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("roles");

    const roles = user.roles;
    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(0);
  });

  it("Querying related data", async () => {
    const user: any = await User.find(userIds[0]);
    const roles = await user.roles().where("name", "Role 1").get();

    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(1);
  });

  it("With softDelete", async () => {
    await Role.destroy(roleIds[0]);

    const { data: user }: any = await User.with("roles").find(userIds[0]);

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("roles");

    const roles = user.roles;
    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(2);

    const _roles = await Role.withTrashed().get();
    expect(_roles).toEqual(expect.any(Array));
    expect(_roles).toHaveLength(5);
  });

  it("With attach method", async () => {
    const user: any = await User.find(userIds[0]);

    await user.roles().attach(roleIds[3]);

    const roles = await user.roles().get();

    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(3);
  });

  it("With detach method", async () => {
    const user: any = await User.find(userIds[0]);

    await user.roles().detach([roleIds[1], roleIds[2]]);

    const roles = await user.roles().get();

    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(1);
  });

  it("With sync method", async () => {
    const user: any = await User.find(userIds[0]);

    await user.roles().sync([roleIds[1], roleIds[2]]);

    const roles = await user.roles().get();

    expect(roles).toEqual(expect.any(Array));
    expect(roles).toHaveLength(2);
  });
});
