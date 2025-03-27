import Collection from "../../src/Collection";

describe("Collection.where", () => {
  let collection: Collection<{ id: number; name: string; age: number }>;

  beforeEach(() => {
    collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
      { id: 3, name: "Charlie", age: 35 },
      { id: 4, name: "Alice", age: 40 }
    );
  });

  it("filters using a callback function", () => {
    const result = collection.where((item) => item.age > 30);
    expect(result).toEqual(
      new Collection(
        { id: 3, name: "Charlie", age: 35 },
        { id: 4, name: "Alice", age: 40 }
      )
    );
  });

  it("filters with a key and value using the default '=' operator", () => {
    const result = collection.where("name", "Alice");
    expect(result).toEqual(
      new Collection(
        { id: 1, name: "Alice", age: 25 },
        { id: 4, name: "Alice", age: 40 }
      )
    );
  });

  it("filters with a key, operator, and value (e.g., '>')", () => {
    const result = collection.where("age", ">", 30);
    expect(result).toEqual(
      new Collection(
        { id: 3, name: "Charlie", age: 35 },
        { id: 4, name: "Alice", age: 40 }
      )
    );
  });

  it("throws an error for unsupported operators", () => {
    expect(() => collection.where("age", "unsupported", 30)).toThrow(
      "Unsupported operator: unsupported"
    );
  });

  it("filters with the 'in' operator", () => {
    // @ts-ignore
    const result = collection.where("id", "in", [1, 3]);
    expect(result).toEqual(
      new Collection(
        { id: 1, name: "Alice", age: 25 },
        { id: 3, name: "Charlie", age: 35 }
      )
    );
  });

  it("filters with the 'regex' operator", () => {
    const result = collection.where("name", "regex", "Alic");
    expect(result).toEqual(
      new Collection(
        { id: 1, name: "Alice", age: 25 },
        { id: 4, name: "Alice", age: 40 }
      )
    );
  });
});
