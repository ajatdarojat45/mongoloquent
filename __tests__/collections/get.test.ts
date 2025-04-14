import { collect } from "../../src";

describe("get", () => {
  it("with key", () => {
    const collection = collect([{ name: "Ajat", framework: "Mongoloquent" }]);

    const result = collection.get("name");

    expect(result).toEqual("Ajat");
  });

  it("with key and default value", () => {
    const collection = collect([{ name: "Ajat", framework: "Mongoloquent" }]);

    const result = collection.get("age", 34);

    expect(result).toEqual(34);
  });

  it("with closure", () => {
    const collection = collect([{ name: "Ajat", framework: "Mongoloquent" }]);

    const result = collection.get("email", () => "ajat@example.com");

    expect(result).toEqual("ajat@example.com");
  });

  it("not exists", () => {
    const collection = collect([{ name: "Ajat", framework: "Mongoloquent" }]);

    const result = collection.get("email");

    expect(result).toEqual(null);
  });
});
