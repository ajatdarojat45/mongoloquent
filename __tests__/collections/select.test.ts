import { collect } from "../../src";

describe("collect", () => {
  it("select multiple item", () => {
    const collection = collect([
      { name: "Ajat Darojat", role: "Developer", status: "active" },
      { name: "Udin", role: "Developer", status: "active" },
    ]);

    const selected = collection.select(["name", "role"]);

    expect(selected.all()).toEqual([
      { name: "Ajat Darojat", role: "Developer" },
      { name: "Udin", role: "Developer" },
    ]);
  });

  it("select single item", () => {
    const collection = collect([
      { name: "Ajat Darojat", role: "Developer", status: "active" },
      { name: "Udin", role: "Developer", status: "active" },
    ]);

    const selected = collection.select("name");

    expect(selected.all()).toEqual([
      { name: "Ajat Darojat" },
      { name: "Udin" },
    ]);
  });
});
