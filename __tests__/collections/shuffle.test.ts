import { collect } from "../../src/";

describe("shuffle", () => {
	it("with array of numbers", () => {
		const numbers = [1, 2, 3, 4, 5];
		const shuffled = collect(numbers).shuffle();
		expect(shuffled).not.toEqual(numbers);
	});

	it("with array of object", () => {
		const objects = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 3, name: "Charlie" },
		];
		const shuffled = collect(objects).shuffle();
		expect(shuffled).not.toEqual(objects);
	});
});
