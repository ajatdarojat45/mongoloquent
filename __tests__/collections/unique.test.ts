import { collect } from "../../src";

describe("unique", () => {
	it("without parameter", () => {
		const collection = collect([1, 1, 2, 2, 3, 4, 2]);

		const unique = collection.unique();

		const result = unique.all();

		expect(result.length).toBe(4);
		expect(result).toEqual([1, 2, 3, 4]);
	});

	it("with array of object", () => {
		const collection = collect([
			{ name: "iPhone 6", brand: "Apple", type: "phone" },
			{ name: "iPhone 5", brand: "Apple", type: "phone" },
			{ name: "Apple Watch", brand: "Apple", type: "watch" },
			{ name: "Galaxy S6", brand: "Samsung", type: "phone" },
			{ name: "Galaxy Gear", brand: "Samsung", type: "watch" },
		]);

		const unique = collection.unique("brand");

		const result = unique.all();
		expect(result.length).toBe(2);
		expect(result).toEqual([
			{ name: "iPhone 6", brand: "Apple", type: "phone" },
			{ name: "Galaxy S6", brand: "Samsung", type: "phone" },
		]);
	});

	it("with callback", () => {
		const collection = collect([
			{ name: "iPhone 6", brand: "Apple", type: "phone" },
			{ name: "iPhone 5", brand: "Apple", type: "phone" },
			{ name: "Apple Watch", brand: "Apple", type: "watch" },
			{ name: "Galaxy S6", brand: "Samsung", type: "phone" },
			{ name: "Galaxy Gear", brand: "Samsung", type: "watch" },
		]);

		const unique = collection.unique(function (item) {
			return item.brand + item.type;
		});

		const result = unique.all();
		expect(result.length).toBe(4);
		expect(result).toEqual([
			{ name: "iPhone 6", brand: "Apple", type: "phone" },
			{ name: "Apple Watch", brand: "Apple", type: "watch" },
			{ name: "Galaxy S6", brand: "Samsung", type: "phone" },
			{ name: "Galaxy Gear", brand: "Samsung", type: "watch" },
		]);
	});
});
