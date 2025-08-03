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

describe("detach method", () => {
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

	it("detach roles to user", async () => {
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
		await user.roles().attach([roleIds[0], roleIds[1]]);
		const roles = await user.roles().get();
		expect(roles.length).toBe(2);

		await user.roles().detach(roleIds[0]);
		const rolesAfterDetach = await user.roles().get();
		expect(rolesAfterDetach.length).toBe(1);
	});
});
