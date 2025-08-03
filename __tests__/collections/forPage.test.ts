import { Collection } from "../../src";

describe("Collection.forPage", () => {
	it("should return the correct items for the given page and perPage", () => {
		const collection = new Collection(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
		const page1 = collection.forPage(1, 3);
		const page2 = collection.forPage(2, 3);
		const page3 = collection.forPage(3, 3);

		expect(page1).toEqual(new Collection(1, 2, 3));
		expect(page2).toEqual(new Collection(4, 5, 6));
		expect(page3).toEqual(new Collection(7, 8, 9));
	});

	it("should throw an error if page is 0 or negative", () => {
		const collection = new Collection(1, 2, 3, 4, 5);

		expect(() => collection.forPage(0, 3)).toThrow(
			"Page and perPage must be positive numbers.",
		);
		expect(() => collection.forPage(-1, 3)).toThrow(
			"Page and perPage must be positive numbers.",
		);
	});

	it("should throw an error if perPage is 0 or negative", () => {
		const collection = new Collection(1, 2, 3, 4, 5);

		expect(() => collection.forPage(1, 0)).toThrow(
			"Page and perPage must be positive numbers.",
		);
		expect(() => collection.forPage(1, -3)).toThrow(
			"Page and perPage must be positive numbers.",
		);
	});

	it("should return an empty collection if the collection is empty", () => {
		const collection = new Collection();
		const page1 = collection.forPage(1, 3);

		expect(page1).toEqual(new Collection());
	});

	it("should return an empty collection if the page exceeds the total number of pages", () => {
		const collection = new Collection(1, 2, 3, 4, 5);
		const page3 = collection.forPage(3, 3);

		expect(page3).toEqual(new Collection());
	});

	it("should return all items if perPage is larger than the collection size", () => {
		const collection = new Collection(1, 2, 3, 4, 5);
		const page1 = collection.forPage(1, 10);

		expect(page1).toEqual(new Collection(1, 2, 3, 4, 5));
	});

	it("should handle edge cases where page and perPage are both 1", () => {
		const collection = new Collection(1, 2, 3, 4, 5);
		const result = collection.forPage(1, 1);

		expect(result).toEqual(new Collection(1));
	});

	it("should handle edge cases where page is 1 and perPage is larger than the collection size", () => {
		const collection = new Collection(1, 2, 3, 4, 5);
		const result = collection.forPage(1, 100);

		expect(result).toEqual(new Collection(1, 2, 3, 4, 5));
	});

	it("should handle edge cases where page is greater than 1 and perPage is larger than the collection size", () => {
		const collection = new Collection(1, 2, 3, 4, 5);
		const result = collection.forPage(2, 100);

		expect(result).toEqual(new Collection());
	});
});
