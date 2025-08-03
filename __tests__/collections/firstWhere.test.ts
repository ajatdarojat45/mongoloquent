import { collect } from "../../src/index";

describe("firstWhere", () => {
	it("with key and value", () => {
		const collection = collect([
			{ name: "Regena", age: null },
			{ name: "Linda", age: 14 },
			{ name: "Diego", age: 23 },
			{ name: "Linda", age: 84 },
		]);

		const result = collection.firstWhere("name", "Linda");

		expect(result).toEqual({ name: "Linda", age: 14 });
	});

	it("with operator", () => {
		const collection = collect([
			{ name: "Regena", age: null },
			{ name: "Linda", age: 14 },
			{ name: "Diego", age: 23 },
			{ name: "Linda", age: 84 },
		]);

		const result = collection.firstWhere("age", ">", 20);

		expect(result).toEqual({ name: "Diego", age: 23 });
	});
	it("with key only", () => {
		const collection = collect([
			{ name: "Regena", age: null },
			{ name: "Linda", age: 14 },
			{ name: "Diego", age: 23 },
			{ name: "Linda", age: 84 },
		]);

		const result = collection.firstWhere("age");

		expect(result).toEqual({ name: "Linda", age: 14 });
	});
});
