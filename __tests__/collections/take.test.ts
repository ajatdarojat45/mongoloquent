import { collect } from "../../src";

describe("take", () => {
	it("with positive number", () => {
		const collection = collect([1, 2, 3, 4, 5]);

		const taken = collection.take(3);

		expect(taken.all()).toEqual([1, 2, 3]);
	});

	it("with negative number", () => {
		const collection = collect([1, 2, 3, 4, 5]);

		const taken = collection.take(-2);

		expect(taken.all()).toEqual([4, 5]);
	});
});
