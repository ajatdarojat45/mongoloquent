import {
	IMongoloquentSchema,
	IMongoloquentSoftDelete,
	IMongoloquentTimestamps,
	Model,
	DB,
	MongoloquentNotFoundException,
} from "../../../src/";

beforeEach(async () => {
	await DB.collection("users").getMongoDBCollection().deleteMany({});
	await DB.collection("roles").getMongoDBCollection().deleteMany({});
	await DB.collection("role_user").getMongoDBCollection().deleteMany({});
});

afterEach(async () => {
	await DB.collection("users").getMongoDBCollection().deleteMany({});
	await DB.collection("roles").getMongoDBCollection().deleteMany({});
	await DB.collection("role_user").getMongoDBCollection().deleteMany({});
});

describe("all method", () => {
	describe("without soft delete", () => {
		interface IUser extends IMongoloquentSchema {
			name: string;
			email: string;
			roles?: IRole[];
		}

		interface IRole extends IMongoloquentSchema {
			name: string;
			description: string;
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

		it("should return related rolses", async () => {
			const userIds = await User.insertMany([
				{ name: "Udin", email: "udin@mail.com" },
				{ name: "Kosasih", email: "kosasih@mail.com" },
			]);

			const roleIds = await Role.insertMany([
				{ name: "Admin", description: "Administrator" },
				{ name: "User", description: "Regular User" },
				{ name: "Guest", description: "Guest User" },
			]);

			await DB.collection(pivotCollection).insertMany([
				{ userId: userIds[0], roleId: roleIds[0] },
				{ userId: userIds[0], roleId: roleIds[1] },
				{ userId: userIds[1], roleId: roleIds[1] },
			]);

			const user = await User.find(userIds[0]);
			const roles = await user.roles().all();
			expect(roles).toHaveLength(2);
			expect(roles[0]).toEqual(expect.any(Object));
			expect(roles[0]).toHaveProperty("name");
			expect(roles[0]).toHaveProperty("description");

			const roles2 = await DB.collection(pivotCollection).get();
			expect(roles2).toEqual(expect.any(Array));
			expect(roles2).toHaveLength(3);
		});
	});

	describe("without soft delete", () => {
		interface IUser extends IMongoloquentSchema {
			name: string;
			email: string;
			roles?: IRole[];
		}

		interface IRole extends IMongoloquentSchema {
			name: string;
			description: string;
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

		it("should return related rolses", async () => {
			const userIds = await User.insertMany([
				{ name: "Udin", email: "udin@mail.com" },
				{ name: "Kosasih", email: "kosasih@mail.com" },
			]);

			const roleIds = await Role.insertMany([
				{ name: "Admin", description: "Administrator" },
				{ name: "User", description: "Regular User" },
				{ name: "Guest", description: "Guest User" },
			]);

			await DB.collection(pivotCollection).insertMany([
				{ userId: userIds[0], roleId: roleIds[0] },
				{ userId: userIds[0], roleId: roleIds[1] },
				{ userId: userIds[1], roleId: roleIds[1] },
			]);

			await Role.destroy(roleIds[0]);

			const user = await User.find(userIds[0]);
			const roles = await user.roles().all();
			expect(roles).toHaveLength(1);
			expect(roles[0]).toEqual(expect.any(Object));
			expect(roles[0]).toHaveProperty("name");
			expect(roles[0]).toHaveProperty("description");

			const roles2 = await Role.get();
			expect(roles2).toEqual(expect.any(Array));
			expect(roles2).toHaveLength(2);

			const roles3 = await Role.withTrashed().get();
			expect(roles3).toEqual(expect.any(Array));
			expect(roles3).toHaveLength(3);
		});
	});
});
