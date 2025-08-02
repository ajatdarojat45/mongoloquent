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

describe("first method", () => {
	it("without param", async () => {
		interface IFlight extends IMongoloquentSchema {
			name: string;
			active: boolean;
			delayed: boolean;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			protected $useTimestamps = false;
		}

		await Flight.insertMany([
			{ name: "Flight 1", active: true, delayed: false },
			{ name: "Flight 2", active: false, delayed: true },
		]);

		const flight = await Flight.first();

		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).toHaveProperty("active", true);
		expect(flight).toHaveProperty("delayed", false);
	});

	it("with single param", async () => {
		interface IFlight extends IMongoloquentSchema {
			name: string;
			active: boolean;
			delayed: boolean;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			static $useTimestamps = false;
		}

		await Flight.insertMany([
			{ name: "Flight 1", active: true, delayed: false },
			{ name: "Flight 2", active: false, delayed: true },
		]);

		const flight = await Flight.first("name");

		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).not.toHaveProperty("active");
		expect(flight).not.toHaveProperty("delayed");
	});

	it("with multiple param", async () => {
		interface IFlight extends IMongoloquentSchema {
			name: string;
			active: boolean;
			delayed: boolean;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			static $useTimestamps = false;
		}

		await Flight.insertMany([
			{ name: "Flight 1", active: true, delayed: false },
			{ name: "Flight 2", active: false, delayed: true },
		]);

		const flight = await Flight.first("name", "active");

		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).toHaveProperty("active", true);
		expect(flight).not.toHaveProperty("delayed");
	});

	it("with array param", async () => {
		interface IFlight extends IMongoloquentSchema {
			name: string;
			active: boolean;
			delayed: boolean;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			static $useTimestamps = false;
		}

		await Flight.insertMany([
			{ name: "Flight 1", active: true, delayed: false },
			{ name: "Flight 2", active: false, delayed: true },
		]);

		const flight = await Flight.first(["name", "active"]);

		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("name", "Flight 1");
		expect(flight).toHaveProperty("active", true);
		expect(flight).not.toHaveProperty("delayed");
	});

	it("with non exist data", async () => {
		interface IFlight extends IMongoloquentSchema {
			name: string;
			active: boolean;
			delayed: boolean;
		}

		class Flight extends Model<IFlight> {
			static $schema: IFlight;
			static $useTimestamps = false;
		}

		await Flight.insertMany([
			{ name: "Flight 1", active: true, delayed: false },
			{ name: "Flight 2", active: true, delayed: true },
		]);

		const flight = await Flight.where("active", false).first();
		expect(flight).toEqual(null);
	});
});
