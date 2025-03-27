import Collection from "../../src/Collection";
import { MongoloquentInvalidOperatorException } from "../../src/exceptions/MongoloquentException";

describe("Collection.firstWhere", () => {
  let collection: Collection<{ id: number; name: string; age: number }>;

  beforeEach(() => {
    collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
      { id: 3, name: "Charlie", age: 35 }
    );
  });

  it("should return the first item matching the key and value with default '=' operator", () => {
    const result = collection.firstWhere("name", "Alice");
    expect(result).toEqual({ id: 1, name: "Alice", age: 25 });
  });

  it("should return the first item matching the key and value with '>' operator", () => {
    const result = collection.firstWhere("age", ">", 30);
    expect(result).toEqual({ id: 3, name: "Charlie", age: 35 });
  });

  it("should return the first item matching the key and value with '<' operator", () => {
    const result = collection.firstWhere("age", "<", 30);
    expect(result).toEqual({ id: 1, name: "Alice", age: 25 });
  });

  it("should return the first item matching the key and value with '>=' operator", () => {
    const result = collection.firstWhere("age", ">=", 30);
    expect(result).toEqual({ id: 2, name: "Bob", age: 30 });
  });

  it("should return the first item matching the key and value with '<=' operator", () => {
    const result = collection.firstWhere("age", "<=", 25);
    expect(result).toEqual({ id: 1, name: "Alice", age: 25 });
  });

  it("should return the first item matching the key and value with '!=' operator", () => {
    const result = collection.firstWhere("name", "!=", "Alice");
    expect(result).toEqual({ id: 2, name: "Bob", age: 30 });
  });

  it("should return the first item matching the key and value with 'in' operator", () => {
    const result = collection.firstWhere("name", "in", ["Alice", "Charlie"]);
    expect(result).toEqual({ id: 1, name: "Alice", age: 25 });
  });

  it("should return the first item matching the key and value with 'nin' operator", () => {
    const result = collection.firstWhere("name", "nin", ["Alice", "Charlie"]);
    expect(result).toEqual({ id: 2, name: "Bob", age: 30 });
  });

  it("should return the first item matching the key and value with 'regex' operator", () => {
    const result = collection.firstWhere("name", "regex", "^A");
    expect(result).toEqual({ id: 1, name: "Alice", age: 25 });
  });

  it("should throw an error for an invalid operator", () => {
    expect(() => collection.firstWhere("name", "invalid", "Alice")).toThrow(
      MongoloquentInvalidOperatorException
    );
  });

  it("should return null if no item matches the condition", () => {
    const result = collection.firstWhere("name", "=", "Nonexistent");
    expect(result).toBeNull();
  });

  it("should return null for an empty collection", () => {
    const emptyCollection = new Collection<{ name: string }>();
    const result = emptyCollection.firstWhere("name", "=", "Alice");
    expect(result).toBeNull();
  });
});
