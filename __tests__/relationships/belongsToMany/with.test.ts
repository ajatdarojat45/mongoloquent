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
	await DB.collection("roleUser").getMongoDBCollection().deleteMany({});
});

afterEach(async () => {
	await DB.collection("users").getMongoDBCollection().deleteMany({});
	await DB.collection("roles").getMongoDBCollection().deleteMany({});
	await DB.collection("role_user").getMongoDBCollection().deleteMany({});
	await DB.collection("roleUser").getMongoDBCollection().deleteMany({});
});

describe("with methods", () => {
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

		it("without options", async () => {
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

			const user = await User.with("roles").find(userIds[0]);
			expect(user).toBeInstanceOf(User);
			expect(user?.roles).toBeInstanceOf(Array);
			expect(user?.roles?.length).toBe(2);
			expect(user?.roles?.[0]).toEqual(expect.any(Object));
			expect(user?.roles?.[0]).toHaveProperty("name");
			expect(user?.roles?.[0]).toHaveProperty("description");
		});

		it("with select options", async () => {
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

			const user = await User.with("roles", {
				select: ["name"],
			}).find(userIds[0]);
			expect(user).toBeInstanceOf(User);
			expect(user?.roles).toBeInstanceOf(Array);
			expect(user?.roles?.length).toBe(2);
			expect(user?.roles?.[0]).toEqual(expect.any(Object));
			expect(user?.roles?.[0]).toHaveProperty("name");
			expect(user?.roles?.[0]).not.toHaveProperty("description");
		});

		it("with exclude options", async () => {
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

			const user = await User.with("roles", {
				exclude: ["description"],
			}).find(userIds[0]);
			expect(user).toBeInstanceOf(User);
			expect(user?.roles).toBeInstanceOf(Array);
			expect(user?.roles?.length).toBe(2);
			expect(user?.roles?.[0]).toEqual(expect.any(Object));
			expect(user?.roles?.[0]).toHaveProperty("name");
			expect(user?.roles?.[0]).not.toHaveProperty("description");
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
		}

		class User extends Model<IUser> {
			protected $collection: string = "users";
			static $schema: IUser;
			protected $useSoftDelete: boolean = true;

			roles() {
				return this.belongsToMany(Role, "roleUser", "user_id", "role_id");
			}
		}

		class Role extends Model<IRole> {
			protected $collection: string = "roles";
			static $schema: IRole;
			protected $useSoftDelete: boolean = true;
		}

		const pivotCollection = "roleUser";

		it("without options", async () => {
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
				{ user_id: userIds[0], role_id: roleIds[0] },
				{ user_id: userIds[0], role_id: roleIds[1] },
				{ user_id: userIds[0], role_id: roleIds[2] },
				{ user_id: userIds[1], role_id: roleIds[1] },
			]);

			await Role.where("_id", roleIds[0]).delete();

			const user = await User.with("roles").find(userIds[0]);
			expect(user).toBeInstanceOf(User);
			expect(user?.roles).toBeInstanceOf(Array);
			expect(user?.roles?.length).toBe(2);
			expect(user?.roles?.[0]).toEqual(expect.any(Object));
			expect(user?.roles?.[0]).toHaveProperty("name");
			expect(user?.roles?.[0]).toHaveProperty("description");

			const roles = await Role.withTrashed().get();
			expect(roles).toBeInstanceOf(Array);
			expect(roles?.length).toBe(3);
		});

		it("with select options", async () => {
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
				{ user_id: userIds[0], role_id: roleIds[0] },
				{ user_id: userIds[0], role_id: roleIds[1] },
				{ user_id: userIds[0], role_id: roleIds[2] },
				{ user_id: userIds[1], role_id: roleIds[1] },
			]);

			await Role.where("_id", roleIds[0]).delete();

			const user = await User.with("roles", { select: ["name"] }).find(
				userIds[0],
			);
			expect(user).toBeInstanceOf(User);
			expect(user?.roles).toBeInstanceOf(Array);
			expect(user?.roles?.length).toBe(2);
			expect(user?.roles?.[0]).toEqual(expect.any(Object));
			expect(user?.roles?.[0]).toHaveProperty("name");
			expect(user?.roles?.[0]).not.toHaveProperty("description");

			const roles = await Role.withTrashed().get();
			expect(roles).toBeInstanceOf(Array);
			expect(roles?.length).toBe(3);
		});

		it("with exclude options", async () => {
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
				{ user_id: userIds[0], role_id: roleIds[0] },
				{ user_id: userIds[0], role_id: roleIds[1] },
				{ user_id: userIds[0], role_id: roleIds[2] },
				{ user_id: userIds[1], role_id: roleIds[1] },
			]);

			await Role.where("_id", roleIds[0]).delete();

			const user = await User.with("roles", { exclude: ["description"] }).find(
				userIds[0],
			);
			expect(user).toBeInstanceOf(User);
			expect(user?.roles).toBeInstanceOf(Array);
			expect(user?.roles?.length).toBe(2);
			expect(user?.roles?.[0]).toEqual(expect.any(Object));
			expect(user?.roles?.[0]).toHaveProperty("name");
			expect(user?.roles?.[0]).not.toHaveProperty("description");

			const roles = await Role.withTrashed().get();
			expect(roles).toBeInstanceOf(Array);
			expect(roles?.length).toBe(3);
		});
	});
});
