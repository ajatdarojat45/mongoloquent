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

describe("restore method", () => {
	it("with instance", async () => {
		interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
			name: string;
			active: boolean;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			protected $useSoftDelete = true;
		}

		const flightIds = await Flight.insertMany([
			{ name: "Flight 1", active: true },
		]);
		await Flight.destroy(flightIds[0]);

		let flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(0);

		flights = await Flight.onlyTrashed().get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(1);

		const flight = await Flight.withTrashed().find(flightIds[0]);
		const restored = await flight?.restore();
		expect(restored).toEqual(expect.any(Number));
		expect(restored).toEqual(1);

		flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(1);

		flights = await Flight.onlyTrashed().get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(0);
	});

	it("with query", async () => {
		interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
			name: string;
			active: boolean;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			protected $useSoftDelete = true;
		}

		await Flight.insertMany([
			{ name: "Flight 1", active: true },
			{ name: "Flight 2", active: true },
		]);
		await Flight.where("active", true).delete();

		let flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(0);

		flights = await Flight.onlyTrashed().get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(2);

		const restored = await Flight.onlyTrashed().where("active", true).restore();
		expect(restored).toEqual(expect.any(Number));
		expect(restored).toEqual(2);

		flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(2);

		flights = await Flight.onlyTrashed().get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(0);
	});
});
