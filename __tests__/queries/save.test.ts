import DB from "../../src/DB";
import Model from "../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
  IMongoloquentTimestamps,
} from "../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("flights").getCollection().deleteMany({});
});

describe("save method", () => {
  describe("save method for insert", () => {
    it("without timestamp and soft delete", async () => {
      interface IFlight extends IMongoloquentSchema {
        name: string;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useTimestamps = false;
      }

      const flight = new Flight();
      flight.name = "Flight 1";
      await flight.save();

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
        static $useTimestamps = true;
      }

      const flight = new Flight();
      flight.name = "Flight 1";
      await flight.save();

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
        static $useTimestamps = false;
      }

      const flight = new Flight();
      flight.name = "Flight 1";
      await flight.save();

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

    it("with timestamp and soft delete", async () => {
      interface IFlight
        extends IMongoloquentSchema,
          IMongoloquentTimestamps,
          IMongoloquentSoftDelete {
        name: string;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useTimestamps = true;
      }

      const flight = new Flight();
      flight.name = "Flight 1";
      await flight.save();

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
  });

  describe("save method for update", () => {
    it("without timestamp and soft delete", async () => {
      interface IFlight extends IMongoloquentSchema {
        name: string;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useTimestamps = false;
      }

      const flight = new Flight();
      flight.name = "Flight 1";
      await flight.save();

      flight.name = "Flight 2";
      await flight.save();

      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("_id");
      expect(flight).toHaveProperty("name", "Flight 2");
      expect(flight).not.toHaveProperty(Flight.query()["$createdAt"]);
      expect(flight).not.toHaveProperty(Flight.query()["$updatedAt"]);
      expect(flight).not.toHaveProperty(Flight.query()["$deletedAt"]);

      const flights = await Flight.get();
      expect(flights).toEqual(expect.any(Array));
      expect(flights).toHaveLength(1);
    });
  });
});
