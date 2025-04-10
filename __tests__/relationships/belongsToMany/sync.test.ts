import DB from "../../../src/DB";
import Model from "../../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("users").getCollection().deleteMany({});
  await DB.collection("roles").getCollection().deleteMany({});
  await DB.collection("role_user").getCollection().deleteMany({});
});

afterEach(async () => {
  await DB.collection("users").getCollection().deleteMany({});
  await DB.collection("roles").getCollection().deleteMany({});
  await DB.collection("role_user").getCollection().deleteMany({});
});

describe("sync method", () => {
  interface IUser extends IMongoloquentSchema {
    name: string;
    email: string;
    roles?: IRole[];
  }

  interface IRole extends IMongoloquentSchema {
    name: string;
    description: string;
    likes?: number;
  }

  class User extends Model<IUser> {
    static $collection: string = "users";
    static $schema: IUser;

    roles() {
      return this.belongsToMany(Role);
    }
  }

  class Role extends Model<IRole> {
    static $collection: string = "roles";
    static $schema: IRole;
  }

  it("sync roles to user", async () => {
    const userIds = await User.insertMany([
      { name: "Udin", email: "udin@mail.com" },
      { name: "Kosasih", email: "kosasih@mail.com" },
    ]);

    const roleIds = await Role.insertMany([
      { name: "Admin", description: "Administrator", likes: 10 },
      { name: "User", description: "Regular User", likes: 20 },
      { name: "Guest", description: "Guest User", likes: 5 },
    ]);

    const user = await User.find(userIds[0]);
    await user.roles().attach(roleIds);
    const roles = await user.roles().get();
    expect(roles.length).toBe(3);

    await user.roles().sync([roleIds[0], roleIds[1]]);
    const rolesAfterDetach = await user.roles().get();
    expect(rolesAfterDetach.length).toBe(2);
  });
});
