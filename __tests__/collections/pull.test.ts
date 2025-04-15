import { collect } from "../../src";

describe("pull", () => {
  it("pull", () => {
    const collection = collect([{ productId: "prod-100", name: "Desk" }]);

    const pulled = collection.pull("name");
    const all = pulled.all();

    expect(all).toEqual([{ productId: "prod-100" }]);
  });
});
