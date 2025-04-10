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

describe("attach method", () => {
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

  it("attach roles to user", async () => {
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
    await user.roles().attach(roleIds[0]);

    const roles = await user.roles().get();
    expect(roles.length).toBe(1);
  });

  it("attach roles to user with values", async () => {
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
    await user.roles().attach<{
      additional: string;
    }>(roleIds[0], { additional: "value" });

    const roles = await user.roles().get();
    expect(roles.length).toBe(1);

    const names = [User.name.toLowerCase(), Role.name.toLowerCase()].sort();
    const pivotCollection = `${names[0]}_${names[1]}`;
    const pivotData = await DB.collection<any>(pivotCollection)
      .where("userId", userIds[0])
      .first();
    expect(pivotData).toBeDefined();
    expect(pivotData.additional).toBe("value");
  });
});
