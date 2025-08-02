import { ObjectId } from "mongodb";

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
	await DB.collection("phones").getMongoDBCollection().deleteMany({});
});

afterEach(async () => {
	await DB.collection("users").getMongoDBCollection().deleteMany({});
	await DB.collection("phones").getMongoDBCollection().deleteMany({});
});

describe("with method", () => {
	describe("without soft delete", () => {
		interface IUser extends IMongoloquentSchema {
			name: string;
			phone?: IPhone;
		}

		interface IPhone extends IMongoloquentSchema {
			number: string;
			countryCode: string;
			userId: ObjectId;
		}

		class User extends Model<IUser> {
			protected $collection: string = "users";
			static $schema: IUser;

			phone() {
				return this.hasOne(Phone);
			}
		}

		class Phone extends Model<IPhone> {
			protected $collection: string = "phones";
			static $schema: IPhone;
		}

		it("without parameters", async () => {
			const userIds = await User.insertMany([
				{ name: "Udin" },
				{ name: "Kosasih" },
			]);

			const phoneIds = await Phone.insertMany([
				{ number: "1234567890", countryCode: "+62", userId: userIds[0] },
				{ number: "0987654321", countryCode: "+62", userId: userIds[1] },
			]);

			const user = await User.with("phone").first();
			expect(user).toBeDefined();
			expect(user?.phone).toBeDefined();
			expect(user?.phone?.number).toBe("1234567890");
			expect(user?.phone?.countryCode).toBe("+62");
			expect(user?.phone?.userId).toEqual(userIds[0]);
		});

		it("with select fields", async () => {
			const userIds = await User.insertMany([
				{ name: "Udin" },
				{ name: "Kosasih" },
			]);

			const phoneIds = await Phone.insertMany([
				{ number: "1234567890", countryCode: "+62", userId: userIds[0] },
				{ number: "0987654321", countryCode: "+62", userId: userIds[1] },
			]);

			const user = await User.with("phone", { select: ["number"] }).first();
			expect(user).toBeDefined();
			expect(user?.phone).toBeDefined();
			expect(user?.phone?.number).toBe("1234567890");
			expect(user?.phone?.countryCode).toBeUndefined();
		});

		it("with exclude fields", async () => {
			const userIds = await User.insertMany([
				{ name: "Udin" },
				{ name: "Kosasih" },
			]);

			const phoneIds = await Phone.insertMany([
				{ number: "1234567890", countryCode: "+62", userId: userIds[0] },
				{ number: "0987654321", countryCode: "+62", userId: userIds[1] },
			]);

			const user = await User.with("phone", { exclude: ["number"] }).first();
			expect(user).toBeDefined();
			expect(user?.phone).toBeDefined();
			expect(user?.phone?.number).toBeUndefined();
			expect(user?.phone?.countryCode).toBe("+62");
		});
	});

	describe("with soft delete", () => {
		interface IUser extends IMongoloquentSchema {
			name: string;
			phone?: IPhone;
		}

		interface IPhone extends IMongoloquentSchema, IMongoloquentSoftDelete {
			number: string;
			countryCode: string;
			userId: ObjectId;
		}

		class User extends Model<IUser> {
			protected $collection: string = "users";
			static $schema: IUser;

			phone() {
				return this.hasOne(Phone);
			}
		}

		class Phone extends Model<IPhone> {
			protected $collection: string = "phones";
			static $schema: IPhone;
			protected $useSoftDelete: boolean = true;
		}

		it("should be undefined", async () => {
			const userIds = await User.insertMany([
				{ name: "Udin" },
				{ name: "Kosasih" },
			]);

			const phoneIds = await Phone.insertMany([
				{ number: "1234567890", countryCode: "+62", userId: userIds[0] },
				{ number: "0987654321", countryCode: "+62", userId: userIds[1] },
			]);

			await Phone.destroy(phoneIds[0]);

			const user = await User.with("phone").first();
			expect(user).toBeDefined();
			expect(user?.phone).not.toEqual(expect.any(Object));
		});
	});
});
