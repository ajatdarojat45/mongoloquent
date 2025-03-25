import Collection from "../../src/Collection";

describe("Collection.except", () => {
  it("should exclude a single key from all objects in the collection", () => {
    const collection = new Collection(
      ...[
        { id: 1, name: "Alice", age: 25 },
        { id: 2, name: "Bob", age: 30 },
      ]
    );

    const result = collection.except("age");
    expect(result).toEqual(
      new Collection(
        ...[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]
      )
    );
  });

  it("should exclude multiple keys from all objects in the collection", () => {
    const collection = new Collection(
      ...[
        { id: 1, name: "Alice", age: 25, city: "New York" },
        { id: 2, name: "Bob", age: 30, city: "Los Angeles" },
      ]
    );

    const result = collection.except(["age", "city"]);

    expect(result).toEqual(
      new Collection(
        ...[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]
      )
    );
  });

  it("should handle keys that do not exist in the objects", () => {
    const collection = new Collection(
      ...[
        { id: 1, name: "Alice", age: 25 },
        { id: 2, name: "Bob", age: 30 },
      ]
    );

    const result = collection.except("nonexistentKey");

    expect(result).toEqual(
      new Collection(
        ...[
          { id: 1, name: "Alice", age: 25 },
          { id: 2, name: "Bob", age: 30 },
        ]
      )
    );
  });

  it("should handle an empty array of keys", () => {
    const collection = new Collection(
      ...[
        { id: 1, name: "Alice", age: 25 },
        { id: 2, name: "Bob", age: 30 },
      ]
    );

    const result = collection.except([]);

    expect(result).toEqual(
      new Collection(
        ...[
          { id: 1, name: "Alice", age: 25 },
          { id: 2, name: "Bob", age: 30 },
        ]
      )
    );
  });

  it("should exclude only valid keys when mixed valid and invalid keys are provided", () => {
    const collection = new Collection(
      ...[
        { id: 1, name: "Alice", age: 25, city: "New York" },
        { id: 2, name: "Bob", age: 30, city: "Los Angeles" },
      ]
    );

    const result = collection.except(["age", "nonexistentKey"]);

    expect(result).toEqual(
      new Collection(
        ...[
          { id: 1, name: "Alice", city: "New York" },
          { id: 2, name: "Bob", city: "Los Angeles" },
        ]
      )
    );
  });
});
