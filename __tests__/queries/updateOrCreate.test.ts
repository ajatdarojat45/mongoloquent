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

describe("updateOrCreate method", () => {
  describe("without timestamp and soft delete", () => {
    it("with one parameter", async () => {
      interface IFlight extends IMongoloquentSchema {
        departure: string;
        destination: string;
        price: number;
        discounted: boolean;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useTimestamps = false;
        static $useSoftDelete = false;
      }

      const flight = await Flight.updateOrCreate({
        departure: "New York",
        destination: "Los Angeles",
      });

      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("_id");
      expect(flight).toHaveProperty("departure", "New York");
      expect(flight).toHaveProperty("destination", "Los Angeles");
      expect(flight).not.toHaveProperty(Flight.query()["$createdAt"]);
      expect(flight).not.toHaveProperty(Flight.query()["$updatedAt"]);
      expect(flight).not.toHaveProperty(Flight.query()["$isDeleted"]);
    });

    it("with two parameters", async () => {
      interface IFlight extends IMongoloquentSchema {
        departure: string;
        destination: string;
        price: number;
        discounted: boolean;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useTimestamps = false;
        static $useSoftDelete = false;
      }

      const flight = await Flight.updateOrCreate(
        { departure: "New York", destination: "Los Angeles" },
        { price: 300, discounted: false },
      );

      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("_id");
      expect(flight).toHaveProperty("departure", "New York");
      expect(flight).toHaveProperty("destination", "Los Angeles");
      expect(flight).toHaveProperty("price", 300);
      expect(flight).toHaveProperty("discounted", false);
      expect(flight).not.toHaveProperty(Flight.query()["$createdAt"]);
      expect(flight).not.toHaveProperty(Flight.query()["$updatedAt"]);
      expect(flight).not.toHaveProperty(Flight.query()["$isDeleted"]);
    });
  });

  describe("with timestamp", () => {
    it("with one parameter", async () => {
      interface IFlight extends IMongoloquentSchema, IMongoloquentTimestamps {
        departure: string;
        destination: string;
        price: number;
        discounted: boolean;
      }
      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useTimestamps = true;
        static $useSoftDelete = false;
      }
      const flight = await Flight.updateOrCreate({
        departure: "New York",
        destination: "Los Angeles",
      });
      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("_id");
      expect(flight).toHaveProperty("departure", "New York");
      expect(flight).toHaveProperty("destination", "Los Angeles");
      expect(flight).toHaveProperty(Flight.query()["$createdAt"]);
      expect(flight).toHaveProperty(Flight.query()["$updatedAt"]);
      expect(flight).not.toHaveProperty(Flight.query()["$isDeleted"]);
    });

    it("with two parameters", async () => {
      interface IFlight extends IMongoloquentSchema, IMongoloquentTimestamps {
        departure: string;
        destination: string;
        price: number;
        discounted: boolean;
      }
      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useTimestamps = true;
        static $useSoftDelete = false;
      }
      const flight = await Flight.updateOrCreate(
        { departure: "New York", destination: "Los Angeles" },
        { price: 300, discounted: false },
      );
      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("_id");
      expect(flight).toHaveProperty("departure", "New York");
      expect(flight).toHaveProperty("destination", "Los Angeles");
      expect(flight).toHaveProperty("price", 300);
      expect(flight).toHaveProperty("discounted", false);
      expect(flight).toHaveProperty(Flight.query()["$createdAt"]);
      expect(flight).toHaveProperty(Flight.query()["$updatedAt"]);
      expect(flight).not.toHaveProperty(Flight.query()["$isDeleted"]);
    });
  });

  describe("with soft delete", () => {
    it("with one parameter", async () => {
      interface IFlight extends IMongoloquentSchema, IMongoloquentSoftDelete {
        departure: string;
        destination: string;
        price: number;
        discounted: boolean;
      }
      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useTimestamps = false;
        static $useSoftDelete = true;
      }
      const flight = await Flight.updateOrCreate({
        departure: "New York",
        destination: "Los Angeles",
      });
      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("_id");
      expect(flight).toHaveProperty("departure", "New York");
      expect(flight).toHaveProperty("destination", "Los Angeles");
      expect(flight).not.toHaveProperty(Flight.query()["$createdAt"]);
      expect(flight).not.toHaveProperty(Flight.query()["$updatedAt"]);
      expect(flight).toHaveProperty(Flight.query()["$isDeleted"], false);
    });
  });

  describe("with soft delete and timestamp", () => {
    it("with one parameter", async () => {
      interface IFlight
        extends IMongoloquentSchema,
          IMongoloquentSoftDelete,
          IMongoloquentTimestamps {
        departure: string;
        destination: string;
        price: number;
        discounted: boolean;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useTimestamps = true;
        static $useSoftDelete = true;
      }
      const flight = await Flight.updateOrCreate({
        departure: "New York",
        destination: "Los Angeles",
      });
      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("_id");
      expect(flight).toHaveProperty("departure", "New York");
      expect(flight).toHaveProperty("destination", "Los Angeles");
      expect(flight).toHaveProperty(Flight.query()["$createdAt"]);
      expect(flight).toHaveProperty(Flight.query()["$updatedAt"]);
      expect(flight).toHaveProperty(Flight.query()["$isDeleted"], false);
    });

    it("with two parameters", async () => {
      interface IFlight
        extends IMongoloquentSchema,
          IMongoloquentSoftDelete,
          IMongoloquentTimestamps {
        departure: string;
        destination: string;
        price: number;
        discounted: boolean;
      }

      class Flight extends Model<IFlight> {
        static $schema: IFlight;
        static $useTimestamps = true;
        static $useSoftDelete = true;
      }
      const flight = await Flight.updateOrCreate(
        { departure: "New York", destination: "Los Angeles" },
        { price: 300, discounted: false },
      );
      expect(flight).toEqual(expect.any(Object));
      expect(flight).toHaveProperty("_id");
      expect(flight).toHaveProperty("departure", "New York");
      expect(flight).toHaveProperty("destination", "Los Angeles");
      expect(flight).toHaveProperty("price", 300);
      expect(flight).toHaveProperty("discounted", false);
      expect(flight).toHaveProperty(Flight.query()["$createdAt"]);
      expect(flight).toHaveProperty(Flight.query()["$updatedAt"]);
      expect(flight).toHaveProperty(Flight.query()["$isDeleted"], false);
    });
  });
});
