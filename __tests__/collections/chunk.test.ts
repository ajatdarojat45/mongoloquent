import { collect } from "../../src/index";

describe("chunk", () => {
	it("with array of numbers", () => {
		const collection = collect([1, 2, 3, 4, 5, 6, 7]);

		const chunked = collection.chunk(4).all();

		expect(chunked).toEqual([
			[1, 2, 3, 4],
			[5, 6, 7],
		]);
	});

	it("with array of objects", () => {
		const collection = collect([
			{ foo: 1 },
			{ foo: 2 },
			{ foo: 3 },
			{ foo: 4 },
			{ foo: 5 },
			{ foo: 6 },
			{ foo: 7 },
		]);

		const chunked = collection.chunk(4).all();

		expect(chunked).toEqual([
			[{ foo: 1 }, { foo: 2 }, { foo: 3 }, { foo: 4 }],
			[{ foo: 5 }, { foo: 6 }, { foo: 7 }],
		]);
	});
});
