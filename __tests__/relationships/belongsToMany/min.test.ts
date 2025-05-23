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

describe("min method", () => {
  describe("without soft delete", () => {
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
      protected $collection: string = "users";
      static $schema: IUser;

      roles() {
        return this.belongsToMany(Role);
      }
    }

    class Role extends Model<IRole> {
      protected $collection: string = "roles";
      static $schema: IRole;
    }

    const names = [User.name.toLowerCase(), Role.name.toLowerCase()].sort();
    const pivotCollection = `${names[0]}_${names[1]}`;

    it("return sum documents", async () => {
      const userIds = await User.insertMany([
        { name: "Udin", email: "udin@mail.com" },
        { name: "Kosasih", email: "kosasih@mail.com" },
      ]);

      const roleIds = await Role.insertMany([
        { name: "Admin", description: "Administrator", likes: 10 },
        { name: "User", description: "Regular User", likes: 20 },
        { name: "Guest", description: "Guest User", likes: 5 },
      ]);

      await DB.collection(pivotCollection).insertMany([
        { userId: userIds[0], roleId: roleIds[0] },
        { userId: userIds[0], roleId: roleIds[1] },
        { userId: userIds[1], roleId: roleIds[1] },
      ]);

      const user = await User.find(userIds[0]);
      const role = await user.roles().min("likes");
      expect(role).toBe(10);
    });
  });

  describe("with soft delete", () => {
    interface IUser extends IMongoloquentSchema, IMongoloquentSoftDelete {
      name: string;
      email: string;
      roles?: IRole[];
    }

    interface IRole extends IMongoloquentSchema, IMongoloquentSoftDelete {
      name: string;
      description: string;
      likes?: number;
    }

    class User extends Model<IUser> {
      protected $collection: string = "users";
      static $schema: IUser;
      protected $useSoftDelete: boolean = true;

      roles() {
        return this.belongsToMany(Role);
      }
    }

    class Role extends Model<IRole> {
      protected $collection: string = "roles";
      static $schema: IRole;
      protected $useSoftDelete: boolean = true;
    }

    const names = [User.name.toLowerCase(), Role.name.toLowerCase()].sort();
    const pivotCollection = `${names[0]}_${names[1]}`;

    it("return count documents", async () => {
      const userIds = await User.insertMany([
        { name: "Udin", email: "udin@mail.com" },
        { name: "Kosasih", email: "kosasih@mail.com" },
      ]);

      const roleIds = await Role.insertMany([
        { name: "Admin", description: "Administrator", likes: 10 },
        { name: "User", description: "Regular User", likes: 5 },
        { name: "Guest", description: "Guest User", likes: 30 },
      ]);

      await DB.collection(pivotCollection).insertMany([
        { userId: userIds[0], roleId: roleIds[0] },
        { userId: userIds[0], roleId: roleIds[1] },
        { userId: userIds[1], roleId: roleIds[1] },
      ]);

      await Role.destroy(roleIds[1]);
      const user = await User.find(userIds[0]);
      const role = await user.roles().sum("likes");
      expect(role).toBe(10);

      const role2 = await user.roles().withTrashed().min("likes");
      expect(role2).toBe(5);
    });
  });
});
