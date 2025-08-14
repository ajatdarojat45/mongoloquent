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

	it("sync roles to user with values", async () => {
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
		await user.roles().attach(roleIds[2]);
		const roles = await user.roles().get();
		expect(roles.length).toBe(1);

		await user.roles().sync<{
			additional: string;
		}>([roleIds[0], roleIds[1]], {
			doc: { additional: "value" },
		});
		const rolesAfterDetach = await user.roles().get();
		expect(rolesAfterDetach.length).toBe(2);

		const pivot = await DB.collection<any>(pivotCollection)
			.where("userId", userIds[0])
			.first();

		expect(pivot).toBeDefined();
		expect(pivot.additional).toBe("value");
	});
});
