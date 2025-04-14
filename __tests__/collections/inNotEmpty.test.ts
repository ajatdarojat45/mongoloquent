import { collect } from "../../src";

describe("isNotEmpty", () => {
  it("with empty collection", () => {
    const collection = collect([]);

    const result = collection.isNotEmpty();

    expect(result).toEqual(false);
  });
});
