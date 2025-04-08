import DB from "../../src/DB";
import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("flights").getCollection().deleteMany({});
});

describe("pluck method", () => {
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

    const flights = await Flight.pluck("name");

    expect(flights).toEqual(["Flight 1", "Flight 2"]);
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

    const flights = await Flight.pluck("name", "active");

    expect(flights).toEqual([
      { name: "Flight 1", active: true },
      { name: "Flight 2", active: false },
    ]);
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
    const flights = await Flight.pluck(["name", "active"]);
    expect(flights).toEqual([
      { name: "Flight 1", active: true },
      { name: "Flight 2", active: false },
    ]);
  });
});
