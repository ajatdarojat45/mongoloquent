import { collect } from "../../src";

describe("skipUntil", () => {
	it("with array of number", () => {
		const collection = collect([1, 2, 3, 4]);

		const result = collection.skipUntil((value) => value >= 3);

		expect(result.all()).toEqual([3, 4]);
	});

	it("with array of object", () => {
		const collection = collect([
			{
				foo: 1,
			},
			{
				foo: 2,
			},
			{
				foo: 3,
			},
			{
				foo: 4,
			},
		]);

		const result = collection.skipUntil((value) => value.foo >= 3);

		expect(result.all()).toEqual([
			{
				foo: 3,
			},
			{
				foo: 4,
			},
		]);
	});

	it("without parameter", () => {
		const collection = collect([1, 2, 3, 4]);

		const result = collection.skipUntil();

		expect(result.all()).toEqual([]);
	});
});
