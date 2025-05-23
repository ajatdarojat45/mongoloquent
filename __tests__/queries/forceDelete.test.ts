import DB from "../../src/DB";
import Model from "../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("flights").getCollection().deleteMany({});
});

describe("forceDelete method", () => {
  describe("without soft delete", () => {
    it("delete model instance", async () => {
      interface IFlight extends IMongoloquentSchema {
        name: string;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        protected $useSoftDelete = true;
      }

      const flight = new Flight();
      flight.name = "Flight 1";
      await flight.save();

      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("_id");
      expect(flight).toHaveProperty("name", "Flight 1");

      const deleted = await flight.forceDelete();
      expect(deleted).toEqual(expect.any(Number));
      expect(deleted).toBe(1);

      const flights = await Flight.get();
      expect(flights).toEqual(expect.any(Array));
      expect(flights).toHaveLength(0);
    });

    it("delete with query", async () => {
      interface IFlight extends IMongoloquentSchema {
        name: string;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useSoftDelete = true;
      }

      const flight = new Flight();
      flight.name = "Flight 1";
      await flight.save();

      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("_id");
      expect(flight).toHaveProperty("name", "Flight 1");

      const deleted = await Flight.query()
        .where("_id", flight._id)
        .forceDelete();
      expect(deleted).toEqual(expect.any(Number));
      expect(deleted).toBe(1);

      const flights = await Flight.get();
      expect(flights).toEqual(expect.any(Array));
      expect(flights).toHaveLength(0);
    });

    it("multiple delete with query", async () => {
      interface IFlight extends IMongoloquentSchema {
        name: string;
        active: boolean;
      }
      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useSoftDelete = true;
      }

      await Flight.insertMany([
        { name: "Flight 1", active: true },
        { name: "Flight 2", active: true },
      ]);

      const deleted = await Flight.where("active", true).forceDelete();
      expect(deleted).toEqual(expect.any(Number));
      expect(deleted).toBe(2);

      const flights = await Flight.get();
      expect(flights).toEqual(expect.any(Array));
      expect(flights).toHaveLength(0);
    });
  });
});
