import { collect } from "../../src";

describe("skipWhile", () => {
	it("with array of number", () => {
		const collection = collect([1, 2, 3, 4, 5]);

		const result = collection.skipWhile((value) => value <= 3);

		expect(result.all()).toEqual([4, 5]);
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

		const result = collection.skipWhile((value) => value.foo <= 3);

		expect(result.all()).toEqual([
			{
				foo: 4,
			},
		]);
	});

	it("without parameter", () => {
		const collection = collect([1, 2, 3, 4]);

		const result = collection.skipWhile();

		expect(result.all()).toEqual([]);
	});
});
