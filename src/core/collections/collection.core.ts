import { OPERATORS } from "../../constants";
import {
	MongoloquentInvalidArgumentException,
	MongoloquentInvalidOperatorException,
	MongoloquentItemNotFoundException,
	MongoloquentMultipleItemsFoundException,
} from "../../exceptions";

export class Collection<T = any> extends Array<T> {
	constructor(...args: T[]) {
		super(...args);
	}

	after(
		keyOrCallbackOrValue: keyof T | ((item: T) => boolean) | any,
		value?: any,
		strict: boolean = false,
	): T | null {
		if (arguments.length === 1 && typeof keyOrCallbackOrValue !== "function") {
			const index = this.findIndex((item) =>
				strict ? item === keyOrCallbackOrValue : item == keyOrCallbackOrValue,
			);

			console.log(index);

			return index !== -1 && index + 1 < this.length ? this[index + 1] : null;
		}

		if (typeof keyOrCallbackOrValue === "function") {
			const index = this.findIndex(keyOrCallbackOrValue);
			return index !== -1 && index + 1 < this.length ? this[index + 1] : null;
		}

		const index = this.findIndex((item) =>
			strict
				? item[keyOrCallbackOrValue as keyof T] === value
				: item[keyOrCallbackOrValue as keyof T] == value,
		);
		return index !== -1 && index + 1 < this.length ? this[index + 1] : null;
	}

	all(): T[] {
		return this;
	}

	average(keyOrCallback?: keyof T | ((item: T) => number)): number | null {
		return this.avg(keyOrCallback);
	}

	avg(keyOrCallback?: keyof T | ((item: T) => number)): number | null {
		if (this.length === 0) return null;

		if (keyOrCallback === undefined) {
			const sum = this.reduce((total, item) => {
				return total + (typeof item === "number" ? item : 0);
			}, 0);
			return sum / this.length;
		}

		const sum = this.reduce((total, item) => {
			const value =
				typeof keyOrCallback === "function"
					? keyOrCallback(item)
					: (item[keyOrCallback as keyof T] as unknown as number);

			return total + (typeof value === "number" ? value : 0);
		}, 0);

		return sum / this.length;
	}

	before(
		keyOrCallbackOrValue: keyof T | ((item: T) => boolean) | any,
		value?: any,
		strict: boolean = true,
	): T | null {
		if (arguments.length === 1 && typeof keyOrCallbackOrValue !== "function") {
			const index = this.findIndex((item) => item === keyOrCallbackOrValue);
			return index > 0 ? this[index - 1] : null;
		}

		if (typeof keyOrCallbackOrValue === "function") {
			const index = this.findIndex(keyOrCallbackOrValue);
			return index > 0 ? this[index - 1] : null;
		}

		const index = this.findIndex((item) =>
			strict
				? item[keyOrCallbackOrValue as keyof T] === value
				: item[keyOrCallbackOrValue as keyof T] == value,
		);

		return index > 0 ? this[index - 1] : null;
	}

	chunk(size: number): Collection<T[]> {
		if (size <= 0) return new Collection();

		const chunks: T[][] = [];
		for (let i = 0; i < this.length; i += size) {
			chunks.push(this.slice(i, i + size));
		}

		return new Collection(...chunks);
	}

	collect(): Collection<T> {
		return new Collection(...this);
	}

	concat(items: T[] | Collection<T>): Collection<T> {
		return new Collection(...this, ...items);
	}

	contains(
		keyOrCallbackOrValue: keyof T | ((item: T) => boolean) | any,
		value?: any,
	): boolean {
		if (typeof keyOrCallbackOrValue === "function") {
			return this.some(keyOrCallbackOrValue);
		}

		if (arguments.length === 2) {
			return this.some(
				(item) =>
					item &&
					typeof item === "object" &&
					item[keyOrCallbackOrValue as keyof T] == value,
			);
		}

		return this.some((item) => {
			if (item == keyOrCallbackOrValue || item == keyOrCallbackOrValue) {
				return true;
			}

			if (item && typeof item === "object") {
				return Object.values(item).some(
					(propValue) =>
						propValue == keyOrCallbackOrValue ||
						propValue == keyOrCallbackOrValue,
				);
			}

			return false;
		});
	}

	containsStrict(
		keyOrCallbackOrValue: keyof T | ((item: T) => boolean) | any,
		value?: any,
	): boolean {
		if (typeof keyOrCallbackOrValue === "function") {
			return this.some(keyOrCallbackOrValue);
		}

		if (arguments.length === 2) {
			return this.some(
				(item) =>
					item &&
					typeof item === "object" &&
					item[keyOrCallbackOrValue as keyof T] === value,
			);
		}

		return this.some((item) => {
			if (item === keyOrCallbackOrValue || item === keyOrCallbackOrValue) {
				return true;
			}

			if (item && typeof item === "object") {
				return Object.values(item).some(
					(propValue) =>
						propValue === keyOrCallbackOrValue ||
						propValue === keyOrCallbackOrValue,
				);
			}

			return false;
		});
	}

	count(): number {
		return this.length;
	}

	countBy(callback?: (item: T) => any): Collection<Record<string, number>> {
		const result: Record<string, number> = {};

		this.forEach((item) => {
			const key = callback ? callback(item) : (item as any);
			const keyStr = String(key);

			result[keyStr] = (result[keyStr] || 0) + 1;
		});

		return new Collection(result);
	}

	doesntContain(
		predicateOrValueOrKey: ((item: T) => boolean) | string | any,
		value?: any,
	): boolean {
		if (typeof predicateOrValueOrKey === "function") {
			return !this.some(predicateOrValueOrKey);
		}

		if (arguments.length === 2) {
			return !this.some(
				(item) =>
					item &&
					typeof item === "object" &&
					item[predicateOrValueOrKey as keyof T] === value,
			);
		}

		return !this.some((item) => {
			if (item === predicateOrValueOrKey) {
				return true;
			}

			if (item && typeof item === "object") {
				return Object.values(item).some(
					(propValue) => propValue === predicateOrValueOrKey,
				);
			}

			return false;
		});
	}

	duplicates(key?: keyof T): Record<number, any> {
		const result: Record<number, any> = {};
		const seen = new Set<any>();

		this.forEach((item) => {
			const value = key !== undefined ? item[key] : item;
			seen.add(value);
		});

		const alreadyAddedDuplicates = new Set<any>();

		this.forEach((item, index) => {
			const value = key !== undefined ? item[key] : item;

			if (seen.has(value) && !alreadyAddedDuplicates.has(value)) {
				alreadyAddedDuplicates.add(value);
			} else if (alreadyAddedDuplicates.has(value)) {
				result[index] = value;
			}
		});

		return result;
	}

	each(
		callback: (item: T, index: number, collection: this) => boolean | void,
	): this {
		for (let i = 0; i < this.length; i++) {
			if (callback(this[i], i, this) === false) {
				break;
			}
		}
		return this;
	}

	isEvery(
		callbackOrKey:
			| ((item: T, index: number, collection: this) => boolean)
			| string,
		value?: any,
	): boolean {
		if (this.length === 0) return true;

		if (typeof callbackOrKey === "string") {
			return super.every((item: any) => item?.[callbackOrKey] === value);
		}

		return super.every((item, index, array) =>
			typeof callbackOrKey === "function"
				? callbackOrKey(item, index, this)
				: item?.[callbackOrKey] === value,
		);
	}

	except(keys: keyof T | (keyof T)[] | string | string[]): Collection<T> {
		const keysArray: (keyof T | string)[] = Array.isArray(keys) ? keys : [keys];

		return new Collection(
			...this.map((item: any) => {
				if (typeof item !== "object" || item === null) {
					return item;
				}

				const newItem = { ...item };
				keysArray.forEach((key) => {
					delete newItem[key as keyof object];
				});

				return newItem;
			}),
		);
	}

	first(
		predicate?: (item: T, index: number, collection: this) => boolean,
	): T | null {
		if (!predicate) {
			return this.length > 0 ? this[0] : null;
		}

		for (let i = 0; i < this.length; i++) {
			if (predicate(this[i], i, this)) {
				return this[i];
			}
		}

		return null;
	}

	firstOrFail(
		predicate?: (item: T, index: number, collection: this) => boolean,
	): T {
		if (!predicate) {
			if (this.length > 0) {
				return this[0];
			}
			throw new MongoloquentItemNotFoundException(
				"No items found in the collection.",
			);
		}

		for (let i = 0; i < this.length; i++) {
			if (predicate(this[i], i, this)) {
				return this[i];
			}
		}

		throw new MongoloquentItemNotFoundException(
			"No matching item found in the collection.",
		);
	}

	firstWhere<K extends keyof T>(
		key: K,
		operator?: string | T[K],
		value?: any,
	): T | null {
		if (operator === undefined) {
			for (const item of this) {
				if (item[key]) {
					return item;
				}
			}
			return null;
		}

		if (value === undefined) {
			value = operator as T[K];
			operator = "=";
		}

		const op = OPERATORS.find(
			(o) => o.operator === operator || o.mongoOperator === operator,
		);
		if (!op) {
			throw new MongoloquentInvalidOperatorException(
				"Invalid operator provided.",
			);
		}

		for (const item of this) {
			if (this.compare(item[key], op.mongoOperator, value, op.options)) {
				return item;
			}
		}

		return null;
	}

	forget(keys: keyof T | (keyof T)[]): this {
		const keyArray = Array.isArray(keys) ? keys : [keys];

		this.forEach((item) => {
			if (item && typeof item === "object") {
				keyArray.forEach((key) => {
					if (key in item) {
						delete item[key];
					}
				});
			}
		});
		return this;
	}

	forPage(page: number, perPage: number): Collection<T> {
		if (page <= 0 || perPage <= 0) {
			throw new Error("Page and perPage must be positive numbers.");
		}
		const start = (page - 1) * perPage;
		return new Collection(...this.slice(start, start + perPage));
	}

	get(key: string, defaultValue: any = null): any {
		const item = this[0] as any;

		if (item && key in item) {
			return item[key];
		}

		return typeof defaultValue === "function"
			? (defaultValue as () => any)()
			: defaultValue;
	}

	groupBy(
		keyOrCallback: string | ((item: T) => any),
	): Collection<Record<string, T[]>> {
		const grouped: Record<string, T[]> = {};

		this.forEach((item) => {
			const key =
				typeof keyOrCallback === "function"
					? keyOrCallback(item)
					: (item as any)[keyOrCallback];

			if (!grouped[key]) {
				grouped[key] = [];
			}

			grouped[key].push(item);
		});

		return new Collection(
			...Object.entries(grouped).map(([key, value]) => ({
				[key]: value,
			})),
		);
	}

	has(keys: string | string[]): boolean {
		if (!Array.isArray(keys)) {
			keys = [keys];
		}

		return keys.every((key) =>
			this.some((item) => Object.prototype.hasOwnProperty.call(item, key)),
		);
	}

	hasAny(keys: string | string[]): boolean {
		if (!Array.isArray(keys)) {
			keys = [keys];
		}

		return keys.some((key) =>
			this.some((item) => Object.prototype.hasOwnProperty.call(item, key)),
		);
	}

	implode(keyOrGlue: string | ((item: T) => any), glue?: string): string {
		if (typeof keyOrGlue === "function") {
			return this.map(keyOrGlue).join(glue ?? "");
		}

		if (glue !== undefined && typeof this[0] === "object") {
			return this.map((item) => (item as any)?.[keyOrGlue] ?? "").join(glue);
		}

		return this.join(keyOrGlue);
	}

	isEmpty(): boolean {
		return this.length === 0;
	}

	isNotEmpty(): boolean {
		return this.length > 0;
	}

	keyBy(keyOrCallback: string | ((item: T) => string)): Record<string, T> {
		const result: Record<string, T> = {};

		this.forEach((item) => {
			const key =
				typeof keyOrCallback === "function"
					? keyOrCallback(item)
					: (item as any)[keyOrCallback];

			result[key] = item;
		});

		return result;
	}

	last(predicate?: (item: T) => boolean): T | null {
		if (this.length === 0) return null;

		if (!predicate) {
			return this[this.length - 1] ?? null;
		}

		for (let i = this.length - 1; i >= 0; i--) {
			if (predicate(this[i])) {
				return this[i];
			}
		}

		return null;
	}

	static make<U>(items: U[]): Collection<U> {
		return new Collection(...items);
	}

	max(key?: keyof T): number | null {
		if (this.length === 0) return null;

		if (!key) {
			return Math.max(...(this as unknown as number[]));
		}

		return Math.max(
			...this.map((item) => (item[key] as unknown as number) || 0),
		);
	}

	median(key?: keyof T): number | null {
		if (this.length === 0) return null;

		const values = key
			? this.map((item) =>
					typeof item[key] === "number" ? (item[key] as unknown as number) : 0,
				)
			: this.map((item) =>
					typeof item === "number" ? (item as unknown as number) : 0,
				);

		this.forEach((item) => {
			if (typeof item === "number") {
				values.push(item as unknown as number);
			} else if (key && typeof item[key] === "number") {
				values.push(item[key] as unknown as number);
			}
		});

		const sortedValues = values.sort((a, b) => a - b);
		const mid = Math.floor(sortedValues.length / 2);

		return sortedValues.length % 2 !== 0
			? sortedValues[mid]
			: (sortedValues[mid - 1] + sortedValues[mid]) / 2;
	}

	min(key?: keyof T): number | null {
		if (this.length === 0) return null;

		const values: number[] = [];

		if (key) {
			this.forEach((item) => {
				if (typeof item[key] === "number") {
					values.push(item[key] as unknown as number);
				}
			});
		} else {
			this.forEach((item) => {
				if (typeof item === "number") {
					values.push(item as unknown as number);
				}
			});
		}

		return values.length > 0 ? Math.min(...values) : null;
	}

	multiply(times: number): Collection<T> {
		if (typeof times !== "number" || times <= 0) {
			return new Collection(...[]);
		}

		return new Collection(
			...Array(times)
				.fill([...this])
				.flat()
				.map((item) =>
					typeof item === "object" && item !== null ? { ...item } : item,
				),
		);
	}

	nth(step: number, offset: number = 0): Collection<T> {
		if (step <= 0) return new Collection(...[]);
		return new Collection(
			...this.filter((_, index) => (index - offset) % step === 0),
		);
	}

	only(keys: string[]): Collection<Partial<T>> {
		if (!Array.isArray(this)) return new Collection(...[]);

		return new Collection(
			...this.map((item) => {
				if (typeof item !== "object" || item === null) return item;
				return Object.keys(item)
					.filter((key) => keys.includes(key))
					.reduce(
						(acc: any, key) => {
							acc[key] = (item as any)[key];
							return acc;
						},
						{} as Partial<T>,
					);
			}),
		);
	}

	pluck<K extends keyof T>(field: K): Collection<T[K]>;
	pluck<K extends keyof T>(fields: K[]): Collection<Pick<T, K>>;
	pluck<K extends keyof T>(...fields: K[]): Collection<Pick<T, K>>;
	pluck<K extends keyof T>(
		...fields: (K | K[])[]
	): Collection<T[K] | Pick<T, K>> {
		if (fields.length === 0) return new Collection(...[]);

		if (fields.length === 1 && !Array.isArray(fields[0])) {
			const field = fields[0];
			return new Collection(...this.map((item) => item[field]));
		}

		if (fields.length === 1 && Array.isArray(fields[0])) {
			const fieldArray = fields[0];
			return new Collection(
				...this.map((item) =>
					fieldArray.reduce(
						(acc, key) => {
							acc[key] = item[key];
							return acc;
						},
						{} as Pick<T, K>,
					),
				),
			);
		}

		return new Collection(
			...this.map((item) => {
				return fields.reduce(
					(acc, field) => {
						if (Array.isArray(field)) {
							field.forEach((key) => {
								acc[key] = item[key];
							});
						} else {
							acc[field] = item[field];
						}
						return acc;
					},
					{} as Pick<T, K>,
				);
			}),
		);
	}

	pull(key: string): Collection<T> {
		return new Collection(
			...this.map((item: any) => {
				if (typeof item !== "object" || item === null) {
					return item;
				}

				const newItem = { ...item };
				delete newItem[key];
				return newItem;
			}),
		);
	}

	random(
		count?: number | ((collection: Collection<T>) => any),
	): T | Collection<T> {
		if (typeof count === "function") {
			return count(this);
		}

		if (count === undefined) {
			return this[Math.floor(Math.random() * this.length)];
		}

		if (count < 1 || count > this.length) {
			throw new MongoloquentInvalidArgumentException(
				"Count must be between 1 and the length of the collection.",
			);
		}

		const shuffled = [...this].sort(() => 0.5 - Math.random());
		return new Collection(...shuffled.slice(0, count));
	}

	range(key: keyof T, range: [number, number]): Collection<T> {
		const [min, max] = range;
		return new Collection(
			...this.filter((item) => {
				const value = item[key];
				return typeof value === "number" && value >= min && value <= max;
			}),
		);
	}

	search(
		keyOrCallback: keyof T | ((item: T) => boolean),
		value: any,
		strict: boolean = false,
	): number | string | false {
		const isMatch = (item: T) => {
			if (typeof keyOrCallback === "string") {
				const itemValue = item[keyOrCallback as keyof T];
				if (strict) {
					return itemValue === value;
				} else {
					return itemValue == value;
				}
			} else if (typeof keyOrCallback === "function") {
				return keyOrCallback(item);
			}
			return false;
		};

		for (const key in this) {
			if (isMatch(this[key])) {
				return key;
			}
		}
		return false;
	}

	select(keys: string | string[]): Collection<Partial<T>> {
		const keysArray = Array.isArray(keys) ? keys : [keys];

		return new Collection(
			...this.map((item: any) => {
				const selected: Partial<T> = {};
				keysArray.forEach((key) => {
					if (key in item) {
						(selected as Partial<Record<string, any>>)[key] = item[key];
					}
				});
				return selected;
			}),
		);
	}

	shuffle(): Collection<T> {
		const shuffled = [...this];
		let currentIndex = shuffled.length,
			randomIndex;

		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			[shuffled[currentIndex], shuffled[randomIndex]] = [
				shuffled[randomIndex],
				shuffled[currentIndex],
			];
		}

		return new Collection(...shuffled);
	}

	skip(n: number): Collection<T> {
		const skippedItems = this.slice(n);
		return new Collection(...skippedItems);
	}

	skipUntil(callback?: (item: T) => boolean): Collection<T> {
		if (!callback) {
			return new Collection();
		}

		let found = false;
		const result = [];

		for (const item of this) {
			if (!found && callback(item)) {
				found = true;
			}

			if (found) {
				result.push(item);
			}
		}

		return new Collection(...result);
	}

	skipWhile(callback?: (item: T) => boolean): Collection<T> {
		if (!callback) {
			return new Collection();
		}

		let index = 0;

		for (let i = 0; i < this.length; i++) {
			if (!callback(this[i])) {
				index = i;
				break;
			}

			if (i === this.length - 1) {
				return new Collection();
			}
		}

		return new Collection(...this.slice(index));
	}

	sliding(size: number, step: number = 1): Collection<T[]> {
		if (size <= 0 || step <= 0) {
			throw new MongoloquentInvalidArgumentException(
				"Size and step must be positive numbers.",
			);
		}
		let result = [];
		let startIndex = 0;

		while (startIndex + size <= this.length) {
			result.push(this.slice(startIndex, startIndex + size));
			startIndex += step;
		}

		return new Collection(...result);
	}

	sole(key?: keyof T | ((item: T) => boolean), value?: any): T {
		if (!key) {
			if (this.length === 1) {
				return this[0];
			}
			throw new MongoloquentItemNotFoundException("No matching item found.");
		}

		if (value !== undefined) {
			const matchedItems = this.filter((item: any) => item[key] === value);
			if (matchedItems.length === 1) {
				return matchedItems[0];
			} else if (matchedItems.length === 0) {
				throw new MongoloquentItemNotFoundException(
					"Item not found with the specified key and value.",
				);
			} else {
				throw new MongoloquentMultipleItemsFoundException(
					"Multiple items found with the specified key and value.",
				);
			}
		}

		if (typeof key === "function") {
			const matchedItems = this.filter(key);
			if (matchedItems.length === 1) {
				return matchedItems[0];
			} else if (matchedItems.length === 0) {
				throw new MongoloquentItemNotFoundException("No matching item found.");
			} else {
				throw new MongoloquentMultipleItemsFoundException(
					"Multiple items found with the specified condition.",
				);
			}
		}

		throw new MongoloquentItemNotFoundException("No matching item found.");
	}

	sortBy(
		keyOrCallback:
			| keyof T
			| ((a: T, b: T) => number)
			| ((a: T) => any)
			| [keyof T, "asc" | "desc"][],
		direction: "asc" | "desc" = "asc",
	): Collection<T> {
		const sortedArray = [...this];

		if (Array.isArray(keyOrCallback)) {
			sortedArray.sort((a, b) => {
				for (const [key, dir] of keyOrCallback) {
					const valueA = a[key];
					const valueB = b[key];

					if (valueA > valueB) return dir === "asc" ? 1 : -1;
					if (valueA < valueB) return dir === "asc" ? -1 : 1;
				}
				return 0;
			});
		} else if (typeof keyOrCallback === "function") {
			if (keyOrCallback.length === 1) {
				sortedArray.sort((a, b) => {
					const valueA = (keyOrCallback as (item: T) => any)(a);
					const valueB = (keyOrCallback as (item: T) => any)(b);

					if (valueA > valueB) return direction === "asc" ? 1 : -1;
					if (valueA < valueB) return direction === "asc" ? -1 : 1;
					return 0;
				});
			} else {
				sortedArray.sort(keyOrCallback as (a: T, b: T) => number);
			}
		} else {
			sortedArray.sort((a, b) => {
				const valueA = a[keyOrCallback as keyof T];
				const valueB = b[keyOrCallback as keyof T];

				if (valueA > valueB) return direction === "asc" ? 1 : -1;
				if (valueA < valueB) return direction === "asc" ? -1 : 1;
				return 0;
			});
		}

		return new Collection(...sortedArray);
	}

	sortByDesc(
		keyOrCallback:
			| keyof T
			| ((a: T, b: T) => number)
			| [keyof T, "asc" | "desc"][],
	): Collection<T> {
		return this.sortBy(keyOrCallback, "desc");
	}

	sortDesc(): Collection<T> {
		return new Collection(...this.sort().reverse());
	}

	sortKeys(): Collection<T> {
		const sortedEntries = Object.entries(this).sort(([keyA], [keyB]) =>
			keyA.localeCompare(keyB),
		);

		const sortedItems = Object.fromEntries(sortedEntries);
		return new Collection(...Object.values(sortedItems));
	}

	sortKeysDesc(): Collection<T> {
		const sortedEntries = Object.entries(this).sort(([keyA], [keyB]) =>
			keyB.localeCompare(keyA),
		);

		const sortedItems = Object.fromEntries(sortedEntries);
		return new Collection(...Object.values(sortedItems));
	}

	split(numGroups: number): Collection<T[]> {
		if (numGroups <= 0) {
			throw new MongoloquentInvalidArgumentException(
				"The number of groups must be greater than zero.",
			);
		}

		const groupSize = Math.ceil(this.length / numGroups);
		const result: T[][] = [];

		for (let i = 0; i < this.length; i += groupSize) {
			result.push(this.slice(i, i + groupSize));
		}

		return new Collection(...result);
	}

	splitIn(numGroups: number): Collection<T[]> {
		if (numGroups <= 0) {
			throw new Error("The number of groups must be greater than zero.");
		}

		const minGroupSize = Math.floor(this.length / numGroups);
		const remainder = this.length % numGroups;
		const result: T[][] = [];

		let start = 0;
		for (let i = 0; i < numGroups; i++) {
			const groupSize = minGroupSize + (i < remainder ? 1 : 0);
			result.push(this.slice(start, start + groupSize));
			start += groupSize;
		}

		return new Collection(...result);
	}

	sum(keyOrCallback?: keyof T | ((item: T) => number)): number {
		if (this.length === 0) return 0;

		return this.reduce((acc, item: any) => {
			let value: number = 0;

			if (typeof keyOrCallback === "function") {
				value = keyOrCallback(item);
			} else if (
				typeof keyOrCallback === "string" &&
				typeof item === "object" &&
				item[keyOrCallback] !== undefined
			) {
				const extractedValue = item[keyOrCallback];
				if (typeof extractedValue === "number") {
					value = extractedValue;
				}
			} else if (typeof item === "number" && keyOrCallback === undefined) {
				value = item;
			}

			return acc + value;
		}, 0);
	}

	take(limit: number): Collection<T> {
		if (limit === 0) return new Collection();
		if (limit > 0) return new Collection(...this.slice(0, limit));
		return new Collection(...this.slice(limit));
	}

	takeUntil(callbackOrValue: ((item: T) => boolean) | any): Collection<T> {
		let index: number;

		if (typeof callbackOrValue === "function") {
			index = this.findIndex(callbackOrValue);
		} else {
			index = this.findIndex((item) => item === callbackOrValue);
		}

		const result = index === -1 ? this : this.slice(0, index);
		return new Collection(...result);
	}

	takeWhile(callbackOrValue: ((item: T) => boolean) | any): Collection<T> {
		let index: number;

		if (typeof callbackOrValue === "function") {
			index = this.findIndex((item) => !callbackOrValue(item));
		} else {
			index = this.findIndex((item) => item === callbackOrValue);
		}

		const result = index === -1 ? this : this.slice(0, index);
		return new Collection(...result);
	}

	transform(callback: (item: T, index: number) => T): this {
		this.forEach((item, index) => {
			this[index] = callback(item, index);
		});
		return this;
	}

	unique(): Collection<T>;
	unique<K extends keyof T>(key: K): Collection<T>;
	unique(callback: (item: T) => any): Collection<T>;
	unique(param?: keyof T | ((item: T) => any)): Collection<T> {
		const seen = new Set();

		const filtered = this.filter((item) => {
			const value =
				typeof param === "function"
					? param(item)
					: param
						? (item as any)[param]
						: item;
			if (seen.has(value)) return false;
			seen.add(value);
			return true;
		});

		return new Collection(...filtered);
	}

	value<K extends keyof T>(key: K): T[K] | undefined {
		if (this.length === 0) return undefined;
		return this[0][key];
	}

	where<K extends keyof T>(
		keyOrCallback: K | ((item: T) => boolean),
		operatorOrValue?: string | T[K],
		value?: T[K],
	): Collection<T> {
		if (typeof keyOrCallback === "function") {
			return new Collection(...this.filter(keyOrCallback));
		}

		let operator: string;
		let actualValue: any;

		if (value === undefined) {
			operator = "=";
			actualValue = operatorOrValue as T[K];
		} else {
			operator = operatorOrValue as string;
			actualValue = value;
		}

		const operatorMapping = OPERATORS.find(
			(op) => op.operator === operator || op.mongoOperator === operator,
		);
		if (!operatorMapping) {
			throw new Error(`Unsupported operator: ${operator}`);
		}

		return new Collection(
			...this.filter((item) => {
				const itemValue = item[keyOrCallback];
				return this.compare(
					itemValue,
					operatorMapping.mongoOperator,
					actualValue,
					operatorMapping.options,
				);
			}),
		);
	}

	whereBetween<K extends keyof T>(key: K, range: [T[K], T[K]]): Collection<T> {
		const [min, max] = range;

		return new Collection(
			...this.filter((item) => {
				const value = item[key];
				if (typeof value !== "number") return false;
				return (
					typeof value === "number" &&
					value >= (min as number) &&
					value <= (max as number)
				);
			}),
		);
	}

	whereIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
		return new Collection(...this.filter((item) => values.includes(item[key])));
	}

	whereNotBetween<K extends keyof T>(
		key: K,
		range: [T[K], T[K]],
	): Collection<T> {
		const [min, max] = range;
		return new Collection(
			...this.filter((item) => item[key] < min || item[key] > max),
		);
	}

	whereNotIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
		return new Collection(
			...this.filter((item) => !values.includes(item[key])),
		);
	}

	whereNotNull<K extends keyof T>(key: K): Collection<T> {
		return new Collection(
			...this.filter((item) => item[key] !== null && item[key] !== undefined),
		);
	}

	whereNull<K extends keyof T>(key: K): Collection<T> {
		return new Collection(...this.filter((item) => item[key] === null));
	}

	private compare(
		a: any,
		mongoOperator: string,
		b: any,
		options?: string,
	): boolean {
		switch (mongoOperator) {
			case "eq":
				return a === b;
			case "ne":
				return a !== b;
			case "gt":
				return a > b;
			case "lt":
				return a < b;
			case "gte":
				return a >= b;
			case "lte":
				return a <= b;
			case "in":
				return Array.isArray(b) && b.includes(a);
			case "nin":
				return Array.isArray(b) && !b.includes(a);
			case "regex":
				return typeof a === "string" && new RegExp(b, options).test(a);
			default:
				throw new Error(`Unsupported MongoDB operator: ${mongoOperator}`);
		}
	}
}
