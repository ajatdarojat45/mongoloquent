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

describe("exclude method", () => {
	describe("with get method", () => {
		it("with single param", async () => {
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

			const flights = await Flight.exclude("name").get();

			const flight = flights[0];
			expect(flight).toEqual(expect.any(Object));
			expect(flight).not.toHaveProperty("name");
			expect(flight).toHaveProperty("active");
			expect(flight).toHaveProperty("delayed");
		});

		it("with multiple param", async () => {
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

			const flights = await Flight.exclude("name", "active").get();

			const flight = flights[0];
			expect(flight).toEqual(expect.any(Object));
			expect(flight).not.toHaveProperty("name");
			expect(flight).not.toHaveProperty("active");
			expect(flight).toHaveProperty("delayed");
		});

		it("with array param", async () => {
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

			const flights = await Flight.exclude(["name", "active"]).get();

			const flight = flights[0];
			expect(flight).toEqual(expect.any(Object));
			expect(flight).not.toHaveProperty("name");
			expect(flight).not.toHaveProperty("active");
			expect(flight).toHaveProperty("delayed");
		});
	});

	describe("with first method", () => {
		it("with single param", async () => {
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

			const flight = await Flight.exclude("name").first();

			expect(flight).toEqual(expect.any(Object));
			expect(flight).not.toHaveProperty("name");
			expect(flight).toHaveProperty("active");
			expect(flight).toHaveProperty("delayed");
		});

		it("with multiple param", async () => {
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

			const flight = await Flight.exclude("name", "active").first();

			expect(flight).toEqual(expect.any(Object));
			expect(flight).not.toHaveProperty("name");
			expect(flight).not.toHaveProperty("active");
			expect(flight).toHaveProperty("delayed");
		});

		it("with array param", async () => {
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

			const flight = await Flight.exclude(["name", "active"]).first();

			expect(flight).toEqual(expect.any(Object));
			expect(flight).not.toHaveProperty("name");
			expect(flight).not.toHaveProperty("active");
			expect(flight).toHaveProperty("delayed");
		});
	});
});
