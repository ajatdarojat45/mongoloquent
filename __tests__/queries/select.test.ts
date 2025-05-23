import DB from "../../src/DB";
import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("flights").getCollection().deleteMany({});
});

describe("select method", () => {
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

      const flights = await Flight.select("name").get();

      const flight = flights[0];
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
        protected $useTimestamps = false;
      }

      await Flight.insertMany([
        { name: "Flight 1", active: true, delayed: false },
        { name: "Flight 2", active: false, delayed: true },
      ]);

      const flights = await Flight.select("name", "active").get();

      const flight = flights[0];
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
        protected $useTimestamps = false;
      }

      await Flight.insertMany([
        { name: "Flight 1", active: true, delayed: false },
        { name: "Flight 2", active: false, delayed: true },
      ]);

      const flights = await Flight.select(["name", "active"]).get();

      const flight = flights[0];
      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("name", "Flight 1");
      expect(flight).toHaveProperty("active", true);
      expect(flight).not.toHaveProperty("delayed");
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

      const flight = await Flight.select("name").first();

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
        protected $useTimestamps = false;
      }

      await Flight.insertMany([
        { name: "Flight 1", active: true, delayed: false },
        { name: "Flight 2", active: false, delayed: true },
      ]);

      const flight = await Flight.select("name", "active").first();

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
        protected $useTimestamps = false;
      }

      await Flight.insertMany([
        { name: "Flight 1", active: true, delayed: false },
        { name: "Flight 2", active: false, delayed: true },
      ]);

      const flight = await Flight.select(["name", "active"]).first();

      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("name", "Flight 1");
      expect(flight).toHaveProperty("active", true);
      expect(flight).not.toHaveProperty("delayed");
    });
  });
});
