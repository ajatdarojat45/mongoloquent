import {
	IMongoloquentSchema,
	IMongoloquentSoftDelete,
	IMongoloquentTimestamps,
	Model,
	DB,
	MongoloquentNotFoundException,
} from "../../src/";

beforeEach(async () => {
	await DB.collection("flights").getMongoDBCollection().deleteMany({});
});

afterEach(async () => {
	await DB.collection("flights").getMongoDBCollection().deleteMany({});
});

describe("update method", () => {
	it("without timestamp", async () => {
		interface IFlight extends IMongoloquentSchema {
			departure: string;
			destination: string;
			price: number;
			discounted: boolean;
			active: boolean;
			delayed: boolean;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			protected $useTimestamps = false;
		}

		await Flight.insertMany([
			{
				departure: "New York",
				destination: "Los Angeles",
				price: 300,
				discounted: false,
				active: true,
				delayed: false,
			},
			{
				departure: "Chicago",
				destination: "Miami",
				price: 200,
				discounted: true,
				active: true,
				delayed: false,
			},
		]);

		const update = await Flight.where("delayed", false).update({
			delayed: true,
		});
		expect(update).toEqual(expect.any(Object));
		expect(update).toHaveProperty("delayed", true);

		const flights = await Flight.where("delayed", true).get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(1);
	});

	it("with timestamp", async () => {
		interface IFlight extends IMongoloquentSchema, IMongoloquentTimestamps {
			departure: string;
			destination: string;
			price: number;
			discounted: boolean;
			active: boolean;
			delayed: boolean;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			protected $useTimestamps = true;
		}

		await Flight.insertMany([
			{
				departure: "New York",
				destination: "Los Angeles",
				price: 300,
				discounted: false,
				active: true,
				delayed: false,
			},
			{
				departure: "Chicago",
				destination: "Miami",
				price: 200,
				discounted: true,
				active: true,
				delayed: false,
			},
		]);

		const update = await Flight.where("active", true).update({ delayed: true });
		expect(update).toEqual(expect.any(Object));
		expect(update).toHaveProperty("delayed", true);

		const flights = await Flight.where("delayed", true).get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(1);
	});
});
