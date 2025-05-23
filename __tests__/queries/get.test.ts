import DB from "../../src/DB";
import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("flights").getCollection().deleteMany({});
});

describe("get method", () => {
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

    const flights = await Flight.get();

    const flight = flights[0];
    expect(flight).toEqual(expect.any(Object));
    expect(flight).toHaveProperty("name", "Flight 1");
    expect(flight).toHaveProperty("active", true);
    expect(flight).toHaveProperty("delayed", false);
  });

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

    const flights = await Flight.get("name");

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

    const flights = await Flight.get("name", "active");

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

    const flights = await Flight.get(["name", "active"]);

    const flight = flights[0];
    expect(flight).toEqual(expect.any(Object));
    expect(flight).toHaveProperty("name", "Flight 1");
    expect(flight).toHaveProperty("active", true);
    expect(flight).not.toHaveProperty("delayed");
  });
});
