import { collect } from "../../src";

describe("last", () => {
	it("with not params", () => {
		const collection = collect([1, 2, 3, 4]);

		const result = collection.last();

		expect(result).toEqual(4);
	});

	it("with params", () => {
		const collection = collect([1, 2, 3, 4]);

		const result = collection.last((item) => {
			return item < 3;
		});

		expect(result).toEqual(2);
	});
});
