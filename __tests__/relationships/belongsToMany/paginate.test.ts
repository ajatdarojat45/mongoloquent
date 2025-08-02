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

describe("paginate method", () => {
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

		it("without params", async () => {
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
			const role = await user.roles().paginate();
			expect(role).toBeInstanceOf(Object);
			expect(role).toHaveProperty("data");
			expect(role).toHaveProperty("meta");

			const data = role.data;
			expect(data).toHaveLength(2);

			const meta = role.meta;
			expect(meta).toHaveProperty("total", 2);
			expect(meta).toHaveProperty("page", 1);
			expect(meta).toHaveProperty("limit", 15);
			expect(meta).toHaveProperty("lastPage", 1);
		});

		it("with params", async () => {
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
			const role = await user.roles().paginate(2, 1);
			expect(role).toBeInstanceOf(Object);
			expect(role).toHaveProperty("data");
			expect(role).toHaveProperty("meta");

			const data = role.data;
			expect(data).toHaveLength(1);

			const meta = role.meta;
			expect(meta).toHaveProperty("total", 2);
			expect(meta).toHaveProperty("page", 2);
			expect(meta).toHaveProperty("limit", 1);
			expect(meta).toHaveProperty("lastPage", 2);
		});
	});

	describe("with soft delete", () => {
		describe("without soft delete", () => {
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

			it("without params", async () => {
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
					{ userId: userIds[0], roleId: roleIds[2] },
					{ userId: userIds[1], roleId: roleIds[1] },
				]);

				const user = await User.find(userIds[0]);

				await Role.destroy(roleIds[0]);

				const role = await user.roles().paginate();
				expect(role).toBeInstanceOf(Object);
				expect(role).toHaveProperty("data");
				expect(role).toHaveProperty("meta");

				const data = role.data;
				expect(data).toHaveLength(2);

				const meta = role.meta;
				expect(meta).toHaveProperty("total", 2);
				expect(meta).toHaveProperty("page", 1);
				expect(meta).toHaveProperty("limit", 15);
				expect(meta).toHaveProperty("lastPage", 1);
			});

			it("with params", async () => {
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
					{ userId: userIds[0], roleId: roleIds[2] },
					{ userId: userIds[1], roleId: roleIds[1] },
				]);

				await Role.destroy(roleIds[0]);
				const user = await User.find(userIds[0]);
				const role = await user.roles().paginate(2, 1);
				expect(role).toBeInstanceOf(Object);
				expect(role).toHaveProperty("data");
				expect(role).toHaveProperty("meta");

				const data = role.data;
				expect(data).toHaveLength(1);

				const meta = role.meta;
				expect(meta).toHaveProperty("total", 2);
				expect(meta).toHaveProperty("page", 2);
				expect(meta).toHaveProperty("limit", 1);
				expect(meta).toHaveProperty("lastPage", 2);
			});
		});
	});
});
