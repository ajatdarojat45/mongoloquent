import { Collection } from "../../src";

describe("Collection.sortKeys", () => {
	it("should sort the keys of an object in ascending order", () => {
		const collection = new Collection({
			b: 2,
			a: 1,
			c: 3,
		});

		const sortedCollection = collection.sortKeys();

		expect(sortedCollection).toBeInstanceOf(Collection);
		expect(sortedCollection).toEqual(
			new Collection({
				a: 1,
				b: 2,
				c: 3,
			}),
		);
	});

	it("should handle nested objects correctly", () => {
		const collection = new Collection({
			z: { b: 2, a: 1 },
			y: { d: 4, c: 3 },
		});

		const sortedCollection = collection.sortKeys();

		expect(sortedCollection).toBeInstanceOf(Collection);
		expect(sortedCollection).toEqual(
			new Collection({
				y: { d: 4, c: 3 },
				z: { b: 2, a: 1 },
			}),
		);
	});

	it("should return an empty collection when called on an empty collection", () => {
		const collection = new Collection();

		const sortedCollection = collection.sortKeys();

		expect(sortedCollection).toBeInstanceOf(Collection);
		expect(sortedCollection).toEqual(new Collection());
	});

	it("should not throw errors when called on a collection with non-object elements", () => {
		const collection = new Collection(1, 2, 3);

		const sortedCollection = collection.sortKeys();

		expect(sortedCollection).toBeInstanceOf(Collection);
		expect(sortedCollection).toEqual(new Collection(1, 2, 3));
	});
});
