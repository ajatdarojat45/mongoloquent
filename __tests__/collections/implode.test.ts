import Collection from "../../src/Collection";

describe("Collection - implode", () => {
  it("should implode values of a given key with default glue", () => {
    const collection = new Collection(
      { name: "Alice" },
      { name: "Bob" },
      { name: "Charlie" }
    );
    const result = collection.implode("name");
    expect(result).toBe("AliceBobCharlie");
  });

  it("should implode values of a given key with custom glue", () => {
    const collection = new Collection(
      { name: "Alice" },
      { name: "Bob" },
      { name: "Charlie" }
    );
    const result = collection.implode("name", ", ");
    expect(result).toBe("Alice, Bob, Charlie");
  });

  it("should implode values using a callback function with default glue", () => {
    const collection = new Collection(
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 },
      { name: "Charlie", age: 35 }
    );
    const result = collection.implode((item) => item.age.toString());
    expect(result).toBe("253035");
  });

  it("should implode values using a callback function with custom glue", () => {
    const collection = new Collection(
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 },
      { name: "Charlie", age: 35 }
    );
    const result = collection.implode((item) => item.age.toString(), " - ");
    expect(result).toBe("25 - 30 - 35");
  });

  it("should return an empty string when the collection is empty", () => {
    const collection = new Collection();
    const result = collection.implode("name");
    expect(result).toBe("");
  });

  it("should return an empty string when the key does not exist", () => {
    const collection = new Collection(
      { name: "Alice" },
      { name: "Bob" },
      { name: "Charlie" }
    );
    const result = collection.implode("nonExistentKey");
    expect(result).toBe("");
  });

  it("should return an empty string when the callback returns undefined", () => {
    const collection = new Collection(
      { name: "Alice" },
      { name: "Bob" },
      { name: "Charlie" }
    );
    const result = collection.implode(() => undefined);
    expect(result).toBe("");
  });
});
