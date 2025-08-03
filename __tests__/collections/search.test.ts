import { Collection } from "../../src";

describe("Collection.search", () => {
	let collection: Collection<{ id: number; name: string; age: number }>;

	beforeEach(() => {
		collection = new Collection(
			{ id: 1, name: "Alice", age: 25 },
			{ id: 2, name: "Bob", age: 30 },
			{ id: 3, name: "Charlie", age: 35 },
		);
	});

	it("should find an item by key and value (strict comparison)", () => {
		const result = collection.search("name", "Alice", true);
		expect(result).toBe("0"); // Index of the matching item
	});

	it("should find an item by key and value (non-strict comparison)", () => {
		const result = collection.search("age", "30", false);
		expect(result).toBe("1"); // Index of the matching item
	});

	it("should find an item using a callback function", () => {
		const result = collection.search((item) => item.age > 30, null);
		expect(result).toBe("2"); // Index of the matching item
	});

	it("should return false if no match is found", () => {
		const result = collection.search("name", "Nonexistent", true);
		expect(result).toBe(false);
	});

	it("should return false if no match is found with a callback", () => {
		const result = collection.search((item) => item.age > 40, null);
		expect(result).toBe(false);
	});

	it("should handle invalid key gracefully", () => {
		const result = collection.search("invalidKey" as any, "value", true);
		expect(result).toBe(false);
	});

	it("should handle empty collection", () => {
		const emptyCollection = new Collection();
		//@ts-ignore
		const result = emptyCollection.search("name", "Alice", true);
		expect(result).toBe(false);
	});

	it("should handle invalid callback gracefully", () => {
		const result = collection.search(null as any, "value", true);
		expect(result).toBe(false);
	});
});
