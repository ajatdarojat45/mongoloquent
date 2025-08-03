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

describe("paginate method", () => {
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

		const flight = await Flight.paginate();
		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("data");
		expect(flight).toHaveProperty("meta");

		const data = flight.data;
		expect(data).toEqual(expect.any(Array));
		expect(data.length).toBe(2);

		const meta = flight.meta;
		expect(meta).toEqual(expect.any(Object));
		expect(meta).toHaveProperty("total", 2);
		expect(meta).toHaveProperty("page", 1);
		expect(meta).toHaveProperty("limit", 15);
		expect(meta).toHaveProperty("lastPage", 1);
	});

	it("with param", async () => {
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

		const flight = await Flight.paginate(1, 1);
		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("data");
		expect(flight).toHaveProperty("meta");

		const data = flight.data;
		expect(data).toEqual(expect.any(Array));
		expect(data.length).toBe(1);

		const meta = flight.meta;
		expect(meta).toEqual(expect.any(Object));
		expect(meta).toHaveProperty("total", 2);
		expect(meta).toHaveProperty("page", 1);
		expect(meta).toHaveProperty("limit", 1);
		expect(meta).toHaveProperty("lastPage", 2);
	});

	it("with page param", async () => {
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

		const flight = await Flight.paginate(2, 1);
		expect(flight).toEqual(expect.any(Object));
		expect(flight).toHaveProperty("data");
		expect(flight).toHaveProperty("meta");

		const data = flight.data;
		expect(data).toEqual(expect.any(Array));
		expect(data.length).toBe(1);

		const meta = flight.meta;
		expect(meta).toEqual(expect.any(Object));
		expect(meta).toHaveProperty("total", 2);
		expect(meta).toHaveProperty("page", 2);
		expect(meta).toHaveProperty("limit", 1);
		expect(meta).toHaveProperty("lastPage", 2);
	});
});
