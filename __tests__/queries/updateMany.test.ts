import DB from "../../src/DB";
import Model from "../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("flights").getCollection().deleteMany({});
});

afterEach(async () => {
  await DB.collection("flights").getCollection().deleteMany({});
});

describe("updateMany method", () => {
  it("without timestamp", async () => {
    interface IFlight extends IMongoloquentSchema {
      departure: string;
      destination: string;
      price: number;
      discounted: boolean;
      active: boolean;
      delayed: boolean;
    }

    class Flight extends Model<IFlight> {
      static $schema: IFlight;
      static $useTimestamps = false;
    }

    await Flight.insertMany([
      {
        departure: "New York",
        destination: "Los Angeles",
        price: 300,
        discounted: false,
        active: true,
        delayed: false,
      },
      {
        departure: "Chicago",
        destination: "Miami",
        price: 200,
        discounted: true,
        active: true,
        delayed: false,
      },
    ]);

    const update = await Flight.where("active", true).updateMany({
      delayed: true,
    });
    expect(update).toEqual(expect.any(Number));
    expect(update).toBe(2);

    const flights = await Flight.where("delayed", true).get();
    expect(flights).toEqual(expect.any(Array));
    expect(flights).toHaveLength(2);
  });

  it("with timestamp", async () => {
    interface IFlight extends IMongoloquentSchema, IMongoloquentTimestamps {
      departure: string;
      destination: string;
      price: number;
      discounted: boolean;
      active: boolean;
      delayed: boolean;
    }

    class Flight extends Model<IFlight> {
      static $schema: IFlight;
      static $useTimestamps = true;
    }

    await Flight.insertMany([
      {
        departure: "New York",
        destination: "Los Angeles",
        price: 300,
        discounted: false,
        active: true,
        delayed: false,
      },
      {
        departure: "Chicago",
        destination: "Miami",
        price: 200,
        discounted: true,
        active: true,
        delayed: false,
      },
    ]);

    const update = await Flight.where("active", true).updateMany({
      delayed: true,
    });
    expect(update).toEqual(expect.any(Number));
    expect(update).toBe(2);

    const flights = await Flight.where("delayed", true).get();
    expect(flights).toEqual(expect.any(Array));
    expect(flights).toHaveLength(2);
  });
});
