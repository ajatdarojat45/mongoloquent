import Collection from "../../src/Collection";

interface IUser {
  id: number | string;
  name: string;
}

let collection = new Collection<IUser>(
  ...[
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ]
);

describe("chunk", () => {
  it("should chunk the collection into multiple smaller collections", () => {
    let chunks = collection.chunk(2);

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toHaveLength(2);
    expect(chunks[1]).toHaveLength(1);
  });

  it("should return an empty collection if the size is 0", () => {
    let chunks = collection.chunk(0);

    expect(chunks).toHaveLength(0);
  });
});
