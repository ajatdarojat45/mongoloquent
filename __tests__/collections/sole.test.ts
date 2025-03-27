import Collection from "../../src/Collection";
import {
  MongoloquentItemNotFoundException,
  MongoloquentMultipleItemsFoundException,
} from "../../src/exceptions/MongoloquentException";

describe("Collection.sole", () => {
  let collection: Collection<{ id: number; name: string }>;

  beforeEach(() => {
    collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    );
  });

  it("should return the sole element when the collection has exactly one element and no key is provided", () => {
    const singleItemCollection = new Collection({ id: 1, name: "Alice" });
    const result = singleItemCollection.sole();
    expect(result).toEqual({ id: 1, name: "Alice" });
  });

  it("should throw MongoloquentItemNotFoundException when the collection is empty and no key is provided", () => {
    const emptyCollection = new Collection();
    expect(() => emptyCollection.sole()).toThrow(
      MongoloquentItemNotFoundException
    );
  });

  it("should return the sole element matching the key-value pair", () => {
    const result = collection.sole("id", 1);
    expect(result).toEqual({ id: 1, name: "Alice" });
  });

  it("should throw MongoloquentItemNotFoundException when no element matches the key-value pair", () => {
    expect(() => collection.sole("id", 99)).toThrow(
      MongoloquentItemNotFoundException
    );
  });

  it("should throw MongoloquentMultipleItemsFoundException when multiple elements match the key-value pair", () => {
    const duplicateCollection = new Collection(
      { id: 1, name: "Alice" },
      { id: 1, name: "Bob" }
    );
    expect(() => duplicateCollection.sole("id", 1)).toThrow(
      MongoloquentMultipleItemsFoundException
    );
  });

  it("should return the sole element matching the callback function", () => {
    const result = collection.sole((item) => item.name === "Alice");
    expect(result).toEqual({ id: 1, name: "Alice" });
  });

  it("should throw MongoloquentItemNotFoundException when no element matches the callback function", () => {
    expect(() => collection.sole((item) => item.name === "Unknown")).toThrow(
      MongoloquentItemNotFoundException
    );
  });

  it("should throw MongoloquentMultipleItemsFoundException when multiple elements match the callback function", () => {
    const duplicateCollection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Alice" }
    );
    expect(() =>
      duplicateCollection.sole((item) => item.name === "Alice")
    ).toThrow(MongoloquentMultipleItemsFoundException);
  });
});
