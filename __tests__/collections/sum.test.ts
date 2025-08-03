import { collect } from "../../src";

describe("sum", () => {
	it("array of numbers", () => {
		const collection = collect([1, 2, 3, 4, 5]);

		const sum = collection.sum();

		expect(sum).toBe(15);
	});

	it("array of objects", () => {
		const collection = collect([
			{ name: "JavaScript: The Good Parts", pages: 176 },
			{ name: "JavaScript: The Definitive Guide", pages: 1096 },
		]);

		collection.sum("pages");

		expect(collection.sum("pages")).toBe(1272);
	});

	it("array of objects with callback", () => {
		const collection = collect([
			{ name: "Chair", colors: ["Black"] },
			{ name: "Desk", colors: ["Black", "Mahogany"] },
			{ name: "Bookcase", colors: ["Red", "Beige", "Brown"] },
		]);

		const result = collection.sum((item) => {
			return item.colors.length;
		});

		expect(result).toBe(6);
	});
});
