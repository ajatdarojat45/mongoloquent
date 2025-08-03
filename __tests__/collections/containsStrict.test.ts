import { collect } from "../../src/index";

describe("containsStrict", () => {
	it("with array of numbers", () => {
		const collection = collect([1, 2, 3, 4, 5]);

		const containsStrict = collection.containsStrict((item: any) => {
			return item > 5;
		});

		expect(containsStrict).toEqual(false);
	});

	it("with array of objects", () => {
		const collection = collect([
			{ foo: 1 },
			{ foo: 2 },
			{ foo: 3 },
			{ foo: 4 },
			{ foo: 5 },
		]);

		const containsStrict = collection.containsStrict((item: any) => {
			return item.foo > 5;
		});

		expect(containsStrict).toEqual(false);
	});

	it("with key and value", () => {
		const collection = collect([{ name: "Desk", price: 100 }]);

		const result = collection.containsStrict("name", "Desk");

		expect(result).toBe(true);
	});

	it("with key and value", () => {
		const collection = collect([{ name: "Desk", price: 100 }]);

		const result = collection.containsStrict("name", "New York");

		expect(result).toBe(false);
	});

	it("aray of objects with one param value", () => {
		const collection = collect([{ name: "Desk", price: 100 }]);

		const result = collection.containsStrict("Desk");

		expect(result).toBe(true);
	});

	it("aray of objects with one param value", () => {
		const collection = collect([{ name: "Desk", price: 100 }]);

		const result = collection.containsStrict("New York");

		expect(result).toBe(false);
	});
});
