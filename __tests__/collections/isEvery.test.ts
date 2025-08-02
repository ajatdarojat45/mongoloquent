import { collect } from "../../src/index";

describe("isEvery", () => {
	it("with array of numbers", () => {
		const collection = collect([1, 2, 3, 4]);

		const result = collection.isEvery((value) => value > 2);

		expect(result).toBe(false);
	});

	it("with empty array", () => {
		const collection = collect([]);

		const result = collection.isEvery((value) => value > 20);

		expect(result).toBe(true);
	});
});
