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

describe("first method", () => {
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

	describe("return first related record", () => {
		it("without param", async () => {
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
			const role = await user.roles().where("name", "User").first();
			expect(role).toEqual(expect.any(Object));
			expect(role).toHaveProperty("name", "User");
			expect(role).toHaveProperty("description", "Regular User");
		});

		it("with single param", async () => {
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
			const role = await user.roles().where("name", "User").first("name");
			expect(role).toEqual(expect.any(Object));
			expect(role).toHaveProperty("name", "User");
			expect(role).not.toHaveProperty("description");
		});

		it("with multiple param", async () => {
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
			const role = await user
				.roles()
				.where("name", "User")
				.first("name", "description");
			expect(role).toEqual(expect.any(Object));
			expect(role).toHaveProperty("name", "User");
			expect(role).toHaveProperty("description", "Regular User");
		});

		it("with array param", async () => {
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
			const role = await user
				.roles()
				.where("name", "User")
				.first(["name", "description"]);
			expect(role).toEqual(expect.any(Object));
			expect(role).toHaveProperty("name", "User");
			expect(role).toHaveProperty("description", "Regular User");
		});
	});

	describe("return null if no related record", () => {
		it("return null", async () => {
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
			let role = await user.roles().where("name", "Guest").first();
			expect(role).toBeNull();

			role = await Role.where("name", "Guest").first();
			expect(role).not.toBeNull();
		});
	});
});
