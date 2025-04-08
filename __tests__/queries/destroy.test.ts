import DB from "../../src/DB";
import Model from "../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("flights").getCollection().deleteMany({});
});

describe("destroy method", () => {
  describe("with soft delete", () => {
    describe("with string param", () => {
      it("with single string param", async () => {
        interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
          name: string;
        }

        class Flight extends Model<IFlight> {
          static $schema: IFlight;
          static $useSoftDelete = true;
        }

        const flightIds = await Flight.insertMany([{ name: "Flight 1" }]);

        const deleted = await Flight.destroy(flightIds[0].toString());
        expect(deleted).toEqual(expect.any(Number));
        expect(deleted).toBe(1);

        const flights = await Flight.get();
        expect(flights).toEqual(expect.any(Array));
        expect(flights).toHaveLength(0);
      });

      it("with multiple string param", async () => {
        interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
          name: string;
        }

        class Flight extends Model<IFlight> {
          static $schema: IFlight;
          static $useSoftDelete = true;
        }

        const flightIds = await Flight.insertMany([
          { name: "Flight 1" },
          { name: "Flight 2" },
        ]);

        const deleted = await Flight.destroy(
          flightIds[0].toString(),
          flightIds[1].toString(),
        );
        expect(deleted).toEqual(expect.any(Number));
        expect(deleted).toBe(2);

        const flights = await Flight.get();
        expect(flights).toEqual(expect.any(Array));
        expect(flights).toHaveLength(0);
      });

      it("with array of string param", async () => {
        interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
          name: string;
        }

        class Flight extends Model<IFlight> {
          static $schema: IFlight;
          static $useSoftDelete = true;
        }

        const flightIds = await Flight.insertMany([
          { name: "Flight 1" },
          { name: "Flight 2" },
        ]);

        const deleted = await Flight.destroy([
          flightIds[0].toString(),
          flightIds[1].toString(),
        ]);
        expect(deleted).toEqual(expect.any(Number));
        expect(deleted).toBe(2);

        const flights = await Flight.get();
        expect(flights).toEqual(expect.any(Array));
        expect(flights).toHaveLength(0);
      });
    });

    describe("with objectId param", () => {
      it("with single objectId param", async () => {});

      it("with multiple objectId param", async () => {});

      it("with array of objectId param", async () => {});
    });
  });

  describe("without soft delete", () => {
    it("with single string param", async () => {
      interface IFlight extends IMongoloquentSchema {
        name: string;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useSoftDelete = false;
      }

      const flightIds = await Flight.insertMany([{ name: "Flight 1" }]);

      const deleted = await Flight.destroy(flightIds[0].toString());
      expect(deleted).toEqual(expect.any(Number));
      expect(deleted).toBe(1);

      const flights = await Flight.get();
      expect(flights).toEqual(expect.any(Array));
      expect(flights).toHaveLength(0);
    });

    it("with multiple string param", async () => {
      interface IFlight extends IMongoloquentSchema {
        name: string;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useSoftDelete = false;
      }

      const flightIds = await Flight.insertMany([
        { name: "Flight 1" },
        { name: "Flight 2" },
      ]);

      const deleted = await Flight.destroy(
        flightIds[0].toString(),
        flightIds[1].toString(),
      );
      expect(deleted).toEqual(expect.any(Number));
      expect(deleted).toBe(2);

      const flights = await Flight.get();
      expect(flights).toEqual(expect.any(Array));
      expect(flights).toHaveLength(0);
    });

    it("with array of string param", async () => {
      interface IFlight extends IMongoloquentSchema {
        name: string;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useSoftDelete = false;
      }

      const flightIds = await Flight.insertMany([
        { name: "Flight 1" },
        { name: "Flight 2" },
      ]);

      const deleted = await Flight.destroy([
        flightIds[0].toString(),
        flightIds[1].toString(),
      ]);
      expect(deleted).toEqual(expect.any(Number));
      expect(deleted).toBe(2);

      const flights = await Flight.get();
      expect(flights).toEqual(expect.any(Array));
      expect(flights).toHaveLength(0);
    });
  });
});
