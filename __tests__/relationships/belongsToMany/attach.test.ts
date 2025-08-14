import { IMongoloquentSchema, Model, DB } from "../../../src/";
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
		}>(roleIds[0], {
			doc: { additional: "value" },
		});

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
