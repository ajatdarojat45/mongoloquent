import {
	IMongoloquentSchema,
	IMongoloquentSoftDelete,
	IMongoloquentTimestamps,
	Model,
	DB,
} from "../../src/";

beforeEach(async () => {
	await DB.collection("flights").getMongoDBCollection().deleteMany({});
});

afterEach(async () => {
	await DB.collection("flights").getMongoDBCollection().deleteMany({});
});

describe("createMany method", () => {
	it("without timestamp and soft delete", async () => {
		interface IFlight extends IMongoloquentSchema {
			name: string;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			protected $useTimestamps = false;
		}

		const flightIds = await Flight.createMany([
			{ name: "Flight 1" },
			{ name: "Flight 2" },
		]);
		expect(flightIds).toEqual(expect.any(Array));
		expect(flightIds).toHaveLength(2);

		const flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(2);

		const flight = flights[0];
		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("_id");
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).not.toHaveProperty(Flight.query()["$createdAt"]);
		expect(flight).not.toHaveProperty(Flight.query()["$updatedAt"]);
		expect(flight).not.toHaveProperty(Flight.query()["$deletedAt"]);
	});

	it("with timestamp", async () => {
		interface IFlight extends IMongoloquentSchema, IMongoloquentTimestamps {
			name: string;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			protected $useTimestamps = true;
		}

		const flightIds = await Flight.createMany([
			{ name: "Flight 1" },
			{ name: "Flight 2" },
		]);
		expect(flightIds).toEqual(expect.any(Array));
		expect(flightIds).toHaveLength(2);

		const flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(2);

		const flight = flights[0];
		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("_id");
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).toHaveProperty(Flight.query()["$createdAt"]);
		expect(flight).toHaveProperty(Flight.query()["$updatedAt"]);
	});

	it("with soft delete", async () => {
		interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
			name: string;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			protected $useSoftDelete = true;
			protected $useTimestamps = false;
		}

		const flightIds = await Flight.createMany([
			{ name: "Flight 1" },
			{ name: "Flight 2" },
		]);
		expect(flightIds).toEqual(expect.any(Array));
		expect(flightIds).toHaveLength(2);

		const flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(2);

		const flight = flights[0];
		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("_id");
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).not.toHaveProperty(Flight.query()["$createdAt"]);
		expect(flight).not.toHaveProperty(Flight.query()["$updatedAt"]);
		expect(flight).not.toHaveProperty(Flight.query()["$deletedAt"]);
	});

	it("with soft delete and timestamp", async () => {
		interface IFlight
			extends IMongoloquentSchema,
				IMongoloquentSoftDelete,
				IMongoloquentTimestamps {
			name: string;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			protected $useSoftDelete = true;
			protected $useTimestamps = true;
		}

		const flightIds = await Flight.createMany([
			{ name: "Flight 1" },
			{ name: "Flight 2" },
		]);
		expect(flightIds).toEqual(expect.any(Array));
		expect(flightIds).toHaveLength(2);

		const flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(2);

		const flight = flights[0];
		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("_id");
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).toHaveProperty(Flight.query()["$createdAt"]);
		expect(flight).toHaveProperty(Flight.query()["$updatedAt"]);
		expect(flight).not.toHaveProperty(Flight.query()["$deletedAt"]);
	});
});
