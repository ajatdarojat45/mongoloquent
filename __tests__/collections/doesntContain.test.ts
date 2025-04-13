import { collect } from "../../src/index";

describe("doesntContain", () => {
  it("array of number with closure", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const result = collection.doesntContain((value: any) => value < 5);

    expect(result).toEqual(false);
  });

  it("array of object", () => {
    const collection = collect([{ name: "Desk", price: 100 }]);

    const result = collection.doesntContain("Table");

    expect(result).toEqual(true);
  });

  it("array of object", () => {
    const collection = collect([{ name: "Desk", price: 100 }]);

    const result = collection.doesntContain("Desk");

    expect(result).toEqual(false);
  });

  it("array of object with key and value", () => {
    const collection = collect([
      { product: "Desk", price: 100 },
      { product: "Chair", price: 200 },
    ]);

    const result = collection.doesntContain("product", "Bookcase");

    expect(result).toEqual(true);
  });
});
