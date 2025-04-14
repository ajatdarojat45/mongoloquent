import { collect } from "../../src";

describe("isEmpty", () => {
  it("with empty collection", () => {
    const collection = collect([]);

    const result = collection.isEmpty();

    expect(result).toEqual(true);
  });
});
