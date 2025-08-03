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

describe("forceDestroy method", () => {
	describe("with string param", () => {
		it("with single string param", async () => {
			interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
				flightNumber: string;
			}

			class Flight extends Model<IFlight> {
				protected collectionName = "flights";
				protected softDelete = true;
			}

			const flightIds = await Flight.insertMany([
				{ name: "Flight 1", [Flight.query()["$isDeleted"]]: true },
			]);

			const deleted = await Flight.forceDestroy(flightIds[0].toString());
			expect(deleted).toEqual(expect.any(Number));
			expect(deleted).toBe(1);

			let flights = await Flight.all();
			expect(flights.length).toBe(0);

			flights = await Flight.withTrashed().all();
			expect(flights.length).toBe(0);
		});

		it("with multiple string param", async () => {
			interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
				flightNumber: string;
			}

			class Flight extends Model<IFlight> {
				protected collectionName = "flights";
				protected softDelete = true;
			}

			const flightIds = await Flight.insertMany([
				{ name: "Flight 1", [Flight.query()["$isDeleted"]]: true },
				{ name: "Flight 2", [Flight.query()["$isDeleted"]]: true },
			]);

			const deleted = await Flight.forceDestroy(
				flightIds[0].toString(),
				flightIds[1].toString(),
			);
			expect(deleted).toEqual(expect.any(Number));
			expect(deleted).toBe(2);

			let flights = await Flight.all();
			expect(flights.length).toBe(0);

			flights = await Flight.withTrashed().all();
			expect(flights.length).toBe(0);
		});

		it("with multiple mixed param", async () => {
			interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
				flightNumber: string;
			}

			class Flight extends Model<IFlight> {
				protected collectionName = "flights";
				protected softDelete = true;
			}

			const flightIds = await Flight.insertMany([
				{ name: "Flight 1", [Flight.query()["$isDeleted"]]: true },
				{ name: "Flight 2", [Flight.query()["$isDeleted"]]: true },
			]);

			const deleted = await Flight.forceDestroy(
				flightIds[0].toString(),
				flightIds[1],
			);
			expect(deleted).toEqual(expect.any(Number));
			expect(deleted).toBe(2);

			let flights = await Flight.all();
			expect(flights.length).toBe(0);

			flights = await Flight.withTrashed().all();
			expect(flights.length).toBe(0);
		});
	});

	describe("with ObjectId param", () => {
		it("with single string param", async () => {
			interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
				flightNumber: string;
			}

			class Flight extends Model<IFlight> {
				protected collectionName = "flights";
				protected softDelete = true;
			}

			const flightIds = await Flight.insertMany([
				{ name: "Flight 1", [Flight.query()["$isDeleted"]]: true },
			]);

			const deleted = await Flight.forceDestroy(flightIds[0]);
			expect(deleted).toEqual(expect.any(Number));
			expect(deleted).toBe(1);

			let flights = await Flight.all();
			expect(flights.length).toBe(0);

			flights = await Flight.withTrashed().all();
			expect(flights.length).toBe(0);
		});

		it("with multiple string param", async () => {
			interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
				flightNumber: string;
			}

			class Flight extends Model<IFlight> {
				protected collectionName = "flights";
				protected softDelete = true;
			}

			const flightIds = await Flight.insertMany([
				{ name: "Flight 1", [Flight.query()["$isDeleted"]]: true },
				{ name: "Flight 2", [Flight.query()["$isDeleted"]]: true },
			]);

			const deleted = await Flight.forceDestroy(
				flightIds[0],
				flightIds[1].toString(),
			);
			expect(deleted).toEqual(expect.any(Number));
			expect(deleted).toBe(2);

			let flights = await Flight.all();
			expect(flights.length).toBe(0);

			flights = await Flight.withTrashed().all();
			expect(flights.length).toBe(0);
		});

		it("with multiple mixed param", async () => {
			interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
				flightNumber: string;
			}

			class Flight extends Model<IFlight> {
				protected collectionName = "flights";
				protected softDelete = true;
			}

			const flightIds = await Flight.insertMany([
				{ name: "Flight 1", [Flight.query()["$isDeleted"]]: true },
				{ name: "Flight 2", [Flight.query()["$isDeleted"]]: true },
			]);

			const deleted = await Flight.forceDestroy(
				flightIds[0],
				flightIds[1].toString(),
			);
			expect(deleted).toEqual(expect.any(Number));
			expect(deleted).toBe(2);

			let flights = await Flight.all();
			expect(flights.length).toBe(0);

			flights = await Flight.withTrashed().all();
			expect(flights.length).toBe(0);
		});
	});

	describe("with array of string param", () => {
		it("with array of string param", async () => {
			interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
				flightNumber: string;
			}

			class Flight extends Model<IFlight> {
				protected collectionName = "flights";
				protected softDelete = true;
			}

			const flightIds = await Flight.insertMany([
				{ name: "Flight 1", [Flight.query()["$isDeleted"]]: true },
				{ name: "Flight 2", [Flight.query()["$isDeleted"]]: true },
			]);

			const deleted = await Flight.forceDestroy([
				flightIds[0].toString(),
				flightIds[1].toString(),
			]);
			expect(deleted).toEqual(expect.any(Number));
			expect(deleted).toBe(2);

			let flights = await Flight.all();
			expect(flights.length).toBe(0);

			flights = await Flight.withTrashed().all();
			expect(flights.length).toBe(0);
		});

		it("with array of ObjectId param", async () => {
			interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
				flightNumber: string;
			}

			class Flight extends Model<IFlight> {
				protected collectionName = "flights";
				protected softDelete = true;
			}

			const flightIds = await Flight.insertMany([
				{ name: "Flight 1", [Flight.query()["$isDeleted"]]: true },
				{ name: "Flight 2", [Flight.query()["$isDeleted"]]: true },
			]);

			const deleted = await Flight.forceDestroy([
				flightIds[0],
				flightIds[1].toString(),
			]);
			expect(deleted).toEqual(expect.any(Number));
			expect(deleted).toBe(2);

			let flights = await Flight.all();
			expect(flights.length).toBe(0);

			flights = await Flight.withTrashed().all();
			expect(flights.length).toBe(0);
		});

		it("with array of mixed param", async () => {
			interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
				flightNumber: string;
			}

			class Flight extends Model<IFlight> {
				protected collectionName = "flights";
				protected softDelete = true;
			}

			const flightIds = await Flight.insertMany([
				{ name: "Flight 1", [Flight.query()["$isDeleted"]]: true },
				{ name: "Flight 2", [Flight.query()["$isDeleted"]]: true },
			]);

			const deleted = await Flight.forceDestroy([
				flightIds[0],
				flightIds[1].toString(),
			]);
			expect(deleted).toEqual(expect.any(Number));
			expect(deleted).toBe(2);

			let flights = await Flight.all();
			expect(flights.length).toBe(0);

			flights = await Flight.withTrashed().all();
			expect(flights.length).toBe(0);
		});
	});
});
