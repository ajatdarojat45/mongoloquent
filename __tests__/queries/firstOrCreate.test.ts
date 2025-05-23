import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IFlight extends IMongoloquentSchema {
  name: string;
  delayed: boolean;
  arrival_time: string;
}

class Flight extends Model<IFlight> {
  protected $collection = "flights";
  protected $useSoftDelete = true;
  protected $useTimestamps = true;
  static $schema: IFlight;
}

describe("Model.firstOrCreate", () => {
  afterAll(async () => {
    await Flight.query()["getCollection"]().deleteMany({});
  });

  it("should return new doc", async () => {
    const flight = await Flight.firstOrCreate({ name: "London to Paris" });
    expect(flight).toEqual(expect.any(Object));
    expect(flight).toHaveProperty("_id");
    expect(flight).toHaveProperty("name", "London to Paris");
  });

  it("should return exsiting doc", async () => {
    const flight = await Flight.firstOrCreate({ name: "London to Paris" });
    expect(flight).toEqual(expect.any(Object));
    expect(flight).toHaveProperty("_id");
    expect(flight).toHaveProperty("name", "London to Paris");

    const flights = await Flight.where("name", "London to Paris").get();
    expect(flights).toEqual(expect.any(Array));
    expect(flights.length).toBe(1);
  });

  it("should return new doc with 2 params", async () => {
    const flight = await Flight.firstOrCreate(
      { name: "Paris to London" },
      {
        delayed: true,
        arrival_time: "2023-10-01T10:00:00Z",
      },
    );
    expect(flight).toEqual(expect.any(Object));
    expect(flight).toHaveProperty("_id");
    expect(flight).toHaveProperty("name", "Paris to London");
    expect(flight).toHaveProperty("delayed", true);
    expect(flight).toHaveProperty("arrival_time", "2023-10-01T10:00:00Z");
  });

  it("should return existing doc with 2 params", async () => {
    const flight = await Flight.firstOrCreate(
      { name: "Paris to London" },
      {
        delayed: true,
        arrival_time: "2023-10-01T10:00:00Z",
      },
    );
    expect(flight).toEqual(expect.any(Object));
    expect(flight).toHaveProperty("_id");
    expect(flight).toHaveProperty("name", "Paris to London");
    expect(flight).toHaveProperty("delayed", true);
    expect(flight).toHaveProperty("arrival_time", "2023-10-01T10:00:00Z");

    const flights = await Flight.where("name", "Paris to London").get();
    expect(flights).toEqual(expect.any(Array));
    expect(flights.length).toBe(1);
  });
});
