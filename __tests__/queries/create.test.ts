import {
	IMongoloquentSchema,
	Model,
	IMongoloquentSoftDelete,
	IMongoloquentTimestamps,
	DB,
} from "../../src";

beforeEach(async () => {
	await DB.collection("flights").getMongoDBCollection().deleteMany({});
});

afterEach(async () => {
	await DB.collection("flights").getMongoDBCollection().deleteMany({});
});

describe("create method", () => {
	it("without timestamp and soft delete", async () => {
		interface IFlight extends IMongoloquentSchema {
			name: string;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			protected $useTimestamps = false;
		}

		const flight = await Flight.create({
			name: "Flight 1",
		});

		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("_id");
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).not.toHaveProperty(Flight.query()["$createdAt"]);
		expect(flight).not.toHaveProperty(Flight.query()["$updatedAt"]);
		expect(flight).not.toHaveProperty(Flight.query()["$deletedAt"]);

		const flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(1);
	});

	it("with timestamp", async () => {
		interface IFlight extends IMongoloquentSchema, IMongoloquentTimestamps {
			name: string;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			protected $useTimestamps = true;
		}

		const flight = await Flight.create({
			name: "Flight 1",
		});

		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("_id");
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).toHaveProperty(Flight.query()["$createdAt"]);
		expect(flight).toHaveProperty(Flight.query()["$updatedAt"]);
		expect(flight).not.toHaveProperty(Flight.query()["$deletedAt"]);

		const flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(1);
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

		const flight = await Flight.create({
			name: "Flight 1",
		});

		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("_id");
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).not.toHaveProperty(Flight.query()["$createdAt"]);
		expect(flight).not.toHaveProperty(Flight.query()["$updatedAt"]);
		expect(flight).toHaveProperty(Flight.query()["$isDeleted"], false);

		const flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(1);
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

		const flight = await Flight.create({
			name: "Flight 1",
		});

		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("_id");
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).toHaveProperty(Flight.query()["$createdAt"]);
		expect(flight).toHaveProperty(Flight.query()["$updatedAt"]);
		expect(flight).toHaveProperty(Flight.query()["$isDeleted"], false);

		const flights = await Flight.get();
		expect(flights).toEqual(expect.any(Array));
		expect(flights).toHaveLength(1);
	});
});
