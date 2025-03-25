import {
  MongoloquentInvalidArgumentException,
  MongoloquentItemNotFoundException,
  MongoloquentMultipleItemsFoundException,
} from "./exceptions/MongoloquentException";
import operators from "./utils/operators";

export default class Collection<T> extends Array<T> {
  constructor(...args: T[]) {
    super(...args);
  }

  after(
    keyOrCallback: keyof T | ((item: T) => boolean),
    value?: any,
    strict: boolean = true
  ): T | null {
    const index = this.findIndex((item) =>
      typeof keyOrCallback === "function"
        ? keyOrCallback(item) // Custom callback function
        : strict
        ? item[keyOrCallback] === value
        : item[keyOrCallback] == value
    );
    return index !== -1 && index + 1 < this.length ? this[index + 1] : null;
  }

  all(): T[] {
    return this; // Returns a copy of the array to prevent mutation
  }

  average(keyOrCallback: keyof T | ((item: T) => number)): number | null {
    return this.avg(keyOrCallback);
  }

  avg(keyOrCallback: keyof T | ((item: T) => number)): number | null {
    if (this.length === 0) return null;

    const sum = this.reduce((total, item) => {
      const value =
        typeof keyOrCallback === "function"
          ? keyOrCallback(item) // Callback function
          : (item[keyOrCallback] as unknown as number); // Numeric field

      return total + (typeof value === "number" ? value : 0);
    }, 0);

    return sum / this.length;
  }

  before(
    keyOrCallback: keyof T | ((item: T) => boolean),
    value?: any,
    strict: boolean = true
  ): T | null {
    const index = this.findIndex((item) =>
      typeof keyOrCallback === "function"
        ? keyOrCallback(item) // Custom callback function
        : strict
        ? item[keyOrCallback] === value
        : item[keyOrCallback] == value
    );
    return index > 0 ? this[index - 1] : null;
  }

  chunk(size: number): Collection<T>[] {
    if (size <= 0) return [];

    const chunks: Collection<T>[] = [];
    for (let i = 0; i < this.length; i += size) {
      chunks.push(new Collection(...this.slice(i, i + size)));
    }

    return chunks;
  }

  collect(): Collection<T> {
    return new Collection(...this);
  }

  concat(items: T[] | Collection<T>): Collection<T> {
    return new Collection(...this, ...items);
  }

  contains(
    keyOrCallback: keyof T | ((item: T) => boolean),
    value?: any
  ): boolean {
    if (typeof keyOrCallback === "function") {
      return this.some(keyOrCallback);
    }

    return this.some((item) => item?.[keyOrCallback] == value);
  }

  // containsStrict(keyOrCallback: keyof T | ((item: T) => boolean), value?: any) {
  //   if (typeof keyOrCallback === "function") {
  //     return this.some(keyOrCallback);
  //   }

  //   return this.some((item) => item?.[keyOrCallback] === value);
  // }

  // count(): number {
  //   return this.length;
  // }

  // countBy(callback?: (item: T) => any): Record<string, number> {
  //   const result: Record<string, number> = {};

  //   this.forEach((item) => {
  //     const key = callback ? callback(item) : (item as any);
  //     const keyStr = String(key); // Ensure key is a string

  //     result[keyStr] = (result[keyStr] || 0) + 1;
  //   });

  //   return result;
  // }

  // doesntContain(
  //   predicate: ((item: T) => boolean) | string,
  //   value?: any
  // ): boolean {
  //   if (typeof predicate === "function") {
  //     return !this.some(predicate);
  //   }

  //   return !this.some((item) => (item as any)?.[predicate] === value);
  // }

  // dump(): this {
  //   console.log(this);
  //   return this;
  // }

  // duplicates(key: keyof T) {
  //   let result: any = {};
  //   const seen = new Set();

  //   this.forEach((item) => {
  //     const value = item[key];
  //     if (seen.has(value)) {
  //       result[value] = (result[value] || 1) + 1;
  //     } else {
  //       seen.add(value);
  //     }
  //   });

  //   return result;
  // }

  // each(
  //   callback: (item: T, index: number, collection: this) => boolean | void
  // ): this {
  //   for (let i = 0; i < this.length; i++) {
  //     if (callback(this[i], i, this) === false) {
  //       break;
  //     }
  //   }
  //   return this;
  // }

  isEvery(
    callbackOrKey:
      | ((item: T, index: number, collection: this) => boolean)
      | string,
    value?: any
  ): boolean {
    if (this.length === 0) return true;

    if (typeof callbackOrKey === "string") {
      // If first param is a key (string), check if all items have the given value
      return super.every((item: any) => item?.[callbackOrKey] === value);
    }

    // If first param is a function, apply the callback
    return super.every((item, index, array) =>
      typeof callbackOrKey === "function"
        ? callbackOrKey(item, index, this)
        : item?.[callbackOrKey] === value
    );
  }

  except(keys: string | string[]) {
    let keysArray: string[] = Array.isArray(keys) ? keys : [keys];

    return this.map((item: any) => {
      if (typeof item !== "object" || item === null) {
        return item;
      }

      keysArray.forEach((key) => {
        delete item[key];
      });

      return item;
    });
  }

  // first(
  //   predicate?: (item: T, index: number, collection: this) => boolean
  // ): T | null {
  //   if (!predicate) {
  //     return this.length > 0 ? this[0] : null;
  //   }

  //   for (let i = 0; i < this.length; i++) {
  //     if (predicate(this[i], i, this)) {
  //       return this[i];
  //     }
  //   }

  //   return null;
  // }

  // firstOrFail(
  //   predicate?: (item: T, index: number, collection: this) => boolean
  // ): T {
  //   if (!predicate) {
  //     if (this.length > 0) {
  //       return this[0];
  //     }
  //     throw new MongoloquentItemNotFoundException();
  //   }

  //   for (let i = 0; i < this.length; i++) {
  //     if (predicate(this[i], i, this)) {
  //       return this[i];
  //     }
  //   }

  //   throw new MongoloquentItemNotFoundException();
  // }

  // firstWhere<K extends keyof T>(
  //   key: K,
  //   operator: string | T[K],
  //   value?: any
  // ): T | null {
  //   // If only two arguments are provided, assume `=` (equal)
  //   if (value === undefined) {
  //     value = operator as T[K];
  //     operator = "=";
  //   }

  //   const op = operators.find((o) => o.operator === operator);
  //   if (!op) {
  //     throw new Error(`Invalid operator: ${operator}`);
  //   }

  //   for (const item of this) {
  //     if (this.compare(item[key], op.mongoOperator, value, op.options)) {
  //       return item;
  //     }
  //   }

  //   return null;
  // }

  // forget(keys: keyof T | (keyof T)[]): this {
  //   const keyArray = Array.isArray(keys) ? keys : [keys];

  //   this.forEach((item) => {
  //     if (item && typeof item === "object") {
  //       keyArray.forEach((key) => {
  //         if (key in item) {
  //           delete item[key];
  //         }
  //       });
  //     }
  //   });
  //   return this;
  // }

  // forPage(page: number, perPage: number): Collection<T> {
  //   const start = (page - 1) * perPage;
  //   return new Collection(this.slice(start, start + perPage));
  // }

  // get(key: string, defaultValue: T | (() => T) | null = null): T | null {
  //   const item = this.find((obj) => (obj as any)?.[key] !== undefined);
  //   if (item) return (item as any)[key];

  //   // If defaultValue is a function, execute it, otherwise return the value
  //   return typeof defaultValue === "function"
  //     ? (defaultValue as () => T)()
  //     : defaultValue;
  // }

  // groupBy(
  //   keyOrCallback: string | ((item: T) => any)
  // ): Collection<Record<string, T[]>> {
  //   const grouped: Record<string, T[]> = {};

  //   this.forEach((item) => {
  //     const key =
  //       typeof keyOrCallback === "function"
  //         ? keyOrCallback(item)
  //         : (item as any)[keyOrCallback];

  //     if (!grouped[key]) {
  //       grouped[key] = [];
  //     }

  //     grouped[key].push(item);
  //   });

  //   return new Collection(
  //     Object.entries(grouped).map(([key, value]) => ({ [key]: value }))
  //   );
  // }

  // has(keys: string | string[]): boolean {
  //   if (!Array.isArray(keys)) {
  //     keys = [keys];
  //   }

  //   return keys.every((key) =>
  //     this.some((item) => Object.prototype.hasOwnProperty.call(item, key))
  //   );
  // }

  // hasAny(keys: string | string[]): boolean {
  //   if (!Array.isArray(keys)) {
  //     keys = [keys];
  //   }

  //   return keys.some((key) =>
  //     this.some((item) => Object.prototype.hasOwnProperty.call(item, key))
  //   );
  // }

  // implode(keyOrGlue: string | ((item: T) => any), glue?: string): string {
  //   if (typeof keyOrGlue === "function") {
  //     return this.map(keyOrGlue).join(glue ?? "");
  //   }

  //   if (typeof keyOrGlue === "string") {
  //     return this.map((item) => (item as any)?.[keyOrGlue] ?? "").join(
  //       glue ?? ""
  //     );
  //   }

  //   return "";
  // }

  // isEmpty(): boolean {
  //   return this.length === 0;
  // }

  // isNotEmpty(): boolean {
  //   return this.length > 0;
  // }

  // keyBy(keyOrCallback: string | ((item: T) => string)): Collection<T> {
  //   const result: Record<string, T> = {};

  //   this.forEach((item) => {
  //     const key =
  //       typeof keyOrCallback === "function"
  //         ? keyOrCallback(item)
  //         : (item as any)[keyOrCallback];
  //     if (key !== undefined) {
  //       result[key] = item;
  //     }
  //   });

  //   return new Collection(Object.values(result));
  // }

  // last(predicate?: (item: T) => boolean): T | null {
  //   if (this.length === 0) return null;

  //   if (!predicate) {
  //     // Return the last item if no predicate is provided
  //     return this[this.length - 1] ?? null;
  //   }

  //   // Iterate from the last element to the first to find the match
  //   for (let i = this.length - 1; i >= 0; i--) {
  //     if (predicate(this[i])) {
  //       return this[i];
  //     }
  //   }

  //   return null;
  // }

  // static make<U>(items: U[] = []): Collection<U> {
  //   return new Collection(items);
  // }

  // mapToGroups<U>(
  //   callback: (item: T, index: number) => Record<string, U>
  // ): Collection<U[]> {
  //   const grouped = new Map<string, U[]>();

  //   this.forEach((item, index) => {
  //     const result = callback(item, index);
  //     const key = Object.keys(result)[0];
  //     const value = result[key];

  //     if (!grouped.has(key)) {
  //       grouped.set(key, []);
  //     }

  //     grouped.get(key)?.push(value);
  //   });

  //   return Collection.make(Array.from(grouped.values()));
  // }

  // mapWithKeys<U>(
  //   callback: (item: T, index: number) => Record<string, U>
  // ): Collection<{ [key: string]: U }> {
  //   const result: { [key: string]: U } = {};

  //   this.forEach((item, index) => {
  //     const entry = callback(item, index);
  //     const key = Object.keys(entry)[0];
  //     result[key] = entry[key]; // Assign value to the corresponding key
  //   });

  //   return Collection.make([result]);
  // }

  // max(key?: keyof T): number | null {
  //   if (this.length === 0) return null;

  //   if (!key) {
  //     // Assume collection contains only numbers
  //     return Math.max(...(this as unknown as number[]));
  //   }

  //   // Extract values based on the key and find the max value
  //   return Math.max(
  //     ...this.map((item) => (item[key] as unknown as number) || 0)
  //   );
  // }

  // median(key?: keyof T): number | null {
  //   if (this.length === 0) return null;

  //   const values = key
  //     ? this.map((item) => (item[key] as unknown as number) || 0)
  //     : (this as unknown as number[]);

  //   const sortedValues = values.sort((a, b) => a - b);
  //   const mid = Math.floor(sortedValues.length / 2);

  //   return sortedValues.length % 2 !== 0
  //     ? sortedValues[mid]
  //     : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
  // }

  // min(key?: keyof T): number | null {
  //   if (this.length === 0) return null;

  //   const values = key
  //     ? this.map((item) => (item[key] as unknown as number) || 0)
  //     : (this as unknown as number[]);

  //   return Math.min(...values);
  // }

  // multiply(times: number): Collection<T> {
  //   if (times <= 0) return new Collection([]);
  //   return new Collection(
  //     Array(times)
  //       .fill([...this])
  //       .flat()
  //   );
  // }

  // nth(step: number, offset: number = 0): Collection<T> {
  //   if (step <= 0) return new Collection([]);
  //   return new Collection(
  //     this.filter((_, index) => (index - offset) % step === 0)
  //   );
  // }

  // only(keys: string[]): Collection<Partial<T>> {
  //   if (!Array.isArray(this)) return new Collection([]);

  //   return new Collection(
  //     this.map((item) => {
  //       if (typeof item !== "object" || item === null) return item;
  //       return Object.keys(item)
  //         .filter((key) => keys.includes(key))
  //         .reduce((acc: any, key) => {
  //           acc[key] = (item as any)[key];
  //           return acc;
  //         }, {} as Partial<T>);
  //     })
  //   );
  // }

  // pluck<K extends keyof T>(keys: K | K[]): Collection<T[K] | Partial<T>> {
  //   if (Array.isArray(keys)) {
  //     return new Collection(
  //       this.map((item) =>
  //         keys.reduce((acc, key) => {
  //           acc[key] = item[key];
  //           return acc;
  //         }, {} as Partial<T>)
  //       )
  //     );
  //   }

  //   return new Collection(this.map((item) => item[keys]));
  // }

  // pull<K extends keyof T>(key: K): T[K] | null {
  //   const index = this.findIndex((item: any) => key in item);
  //   if (index !== -1) {
  //     const [removedItem] = this.splice(index, 1);
  //     return removedItem[key];
  //   }
  //   return null;
  // }

  // random(
  //   count?: number | ((collection: Collection<T>) => any)
  // ): T | Collection<T> {
  //   if (typeof count === "function") {
  //     return count(this);
  //   }

  //   if (count === undefined) {
  //     // Return a single random item
  //     return this[Math.floor(Math.random() * this.length)];
  //   }

  //   if (count < 1 || count > this.length) {
  //     throw new MongoloquentInvalidArgumentException();
  //   }

  //   // Shuffle and take `count` elements
  //   const shuffled = [...this].sort(() => 0.5 - Math.random());
  //   return new Collection(shuffled.slice(0, count));
  // }

  // range(key: keyof T, range: [number, number]): Collection<T> {
  //   const [min, max] = range;
  //   return new Collection(
  //     this.filter((item) => {
  //       const value = item[key];
  //       return typeof value === "number" && value >= min && value <= max;
  //     })
  //   );
  // }

  // search(
  //   keyOrCallback: keyof T | ((item: T) => boolean),
  //   value: any,
  //   strict: boolean = false
  // ): number | string | false {
  //   // If keyOrCallback is a function, we use it as a callback for comparison
  //   const isMatch = (item: T) => {
  //     // If the keyOrCallback is a string (key), check for strict or loose equality
  //     if (typeof keyOrCallback === "string") {
  //       const itemValue = item[keyOrCallback as keyof T];
  //       if (strict) {
  //         return itemValue === value; // Strict comparison
  //       } else {
  //         return itemValue == value; // Loose comparison
  //       }
  //     } else if (typeof keyOrCallback === "function") {
  //       // If keyOrCallback is a callback function, use it for comparison
  //       return keyOrCallback(item);
  //     }
  //     return false;
  //   };

  //   // Iterate over each item in the collection to find a match
  //   for (const key in this) {
  //     if (isMatch(this[key])) {
  //       return key; // Return the key/index if found
  //     }
  //   }
  //   return false; // Return false if no match is found
  // }

  // select(keys: string | string[]): Collection<Partial<T>> {
  //   // If a single key is provided, convert it into an array
  //   const keysArray = Array.isArray(keys) ? keys : [keys];

  //   return new Collection(
  //     this.map((item: any) => {
  //       const selected: Partial<T> = {};
  //       keysArray.forEach((key) => {
  //         if (key in item) {
  //           (selected as Partial<Record<string, any>>)[key] = item[key];
  //         }
  //       });
  //       return selected;
  //     })
  //   );
  // }

  // shuffle(): Collection<T> {
  //   const shuffled = [...this]; // Create a copy of the collection to avoid mutating the original
  //   let currentIndex = shuffled.length,
  //     randomIndex;

  //   // While there remain elements to shuffle
  //   while (currentIndex !== 0) {
  //     // Pick a remaining element
  //     randomIndex = Math.floor(Math.random() * currentIndex);
  //     currentIndex--;

  //     // Swap it with the current element
  //     [shuffled[currentIndex], shuffled[randomIndex]] = [
  //       shuffled[randomIndex],
  //       shuffled[currentIndex],
  //     ];
  //   }

  //   // Return a new collection with the shuffled items
  //   return new Collection(shuffled);
  // }

  // skip(n: number): Collection<T> {
  //   const skippedItems = this.slice(n); // Skips the first `n` elements using slice
  //   return new Collection(skippedItems); // Return a new collection with the skipped items
  // }

  // skipUntil(callback: (item: T) => boolean): Collection<T> {
  //   let found = false;
  //   const result = [];

  //   for (const item of this) {
  //     if (callback(item)) {
  //       found = true;
  //     }

  //     if (found) {
  //       result.push(item); // Add the item once the callback condition is met
  //     }
  //   }

  //   return new Collection(result); // Return a new collection with the remaining items
  // }

  // skipWhile(callback: (item: T) => boolean): Collection<T> {
  //   let skip = true;
  //   const result = [];

  //   for (const item of this) {
  //     if (skip && callback(item)) {
  //       continue; // Skip the item if the callback returns true
  //     }

  //     skip = false; // Once we hit an item where the callback returns false, stop skipping
  //     result.push(item); // Add the item to the result
  //   }

  //   return new Collection(result); // Return a new collection with the remaining items
  // }

  // sliding(size: number, step: number = 1): Collection<T[]> {
  //   let result = [];
  //   let startIndex = 0;

  //   while (startIndex + size <= this.length) {
  //     result.push(this.slice(startIndex, startIndex + size));
  //     startIndex += step; // Move forward by the given step
  //   }

  //   return new Collection(result);
  // }

  // sole(key?: keyof T | ((item: T) => boolean), value?: any): T {
  //   if (!key) {
  //     // If no key is provided, return the first element only if there is exactly one element in the collection
  //     if (this.length === 1) {
  //       return this[0];
  //     }
  //     throw new MongoloquentItemNotFoundException(); // Throw exception if no element found
  //   }

  //   // If a key and value are provided, find the element that matches the key/value pair
  //   if (value !== undefined) {
  //     const matchedItems = this.filter((item: any) => item[key] === value);
  //     if (matchedItems.length === 1) {
  //       return matchedItems[0];
  //     } else if (matchedItems.length === 0) {
  //       throw new MongoloquentItemNotFoundException(); // Throw exception if no matching item is found
  //     } else {
  //       throw new MongoloquentMultipleItemsFoundException(); // Throw exception if multiple matching items are found
  //     }
  //   }

  //   // If a callback is provided, find the element matching the callback
  //   if (typeof key === "function") {
  //     const matchedItems = this.filter(key);
  //     if (matchedItems.length === 1) {
  //       return matchedItems[0];
  //     } else if (matchedItems.length === 0) {
  //       throw new MongoloquentItemNotFoundException(); // Throw exception if no matching item is found
  //     } else {
  //       throw new MongoloquentMultipleItemsFoundException(); // Throw exception if multiple matching items are found
  //     }
  //   }

  //   throw new MongoloquentItemNotFoundException(); // Default exception if no match
  // }

  // sortBy(
  //   keyOrCallback:
  //     | keyof T
  //     | ((a: T, b: T) => number)
  //     | [keyof T, "asc" | "desc"][],
  //   direction: "asc" | "desc" = "asc"
  // ): Collection<T> {
  //   // Clone the array to avoid mutating the original collection
  //   const sortedArray = [...this];

  //   if (Array.isArray(keyOrCallback)) {
  //     // Multiple sorting criteria
  //     sortedArray.sort((a, b) => {
  //       for (const [key, dir] of keyOrCallback) {
  //         const valueA = a[key];
  //         const valueB = b[key];

  //         if (valueA > valueB) return dir === "asc" ? 1 : -1;
  //         if (valueA < valueB) return dir === "asc" ? -1 : 1;
  //       }
  //       return 0;
  //     });
  //   } else if (typeof keyOrCallback === "function") {
  //     // Custom sorting function
  //     sortedArray.sort(keyOrCallback);
  //   } else {
  //     // Single key sorting
  //     sortedArray.sort((a, b) => {
  //       const valueA = a[keyOrCallback];
  //       const valueB = b[keyOrCallback];

  //       if (valueA > valueB) return direction === "asc" ? 1 : -1;
  //       if (valueA < valueB) return direction === "asc" ? -1 : 1;
  //       return 0;
  //     });
  //   }

  //   return new Collection(sortedArray);
  // }

  // sortByDesc(
  //   keyOrCallback:
  //     | keyof T
  //     | ((a: T, b: T) => number)
  //     | [keyof T, "asc" | "desc"][]
  // ): Collection<T> {
  //   return this.sortBy(keyOrCallback, "desc");
  // }

  // sortDesc(): Collection<T> {
  //   return new Collection([...this].sort().reverse());
  // }

  // sortKeys(): Collection<T> {
  //   const sortedEntries = Object.entries(this).sort(([keyA], [keyB]) =>
  //     keyA.localeCompare(keyB)
  //   );

  //   const sortedItems = Object.fromEntries(sortedEntries);
  //   return new Collection(Object.values(sortedItems));
  // }

  // // Sort the collection by keys in descending order
  // sortKeysDesc(): Collection<T> {
  //   const sortedEntries = Object.entries(this).sort(([keyA], [keyB]) =>
  //     keyB.localeCompare(keyA)
  //   );

  //   const sortedItems = Object.fromEntries(sortedEntries);
  //   return new Collection(Object.values(sortedItems));
  // }

  // split(numGroups: number): Collection<T>[] {
  //   if (numGroups <= 0) {
  //     throw new Error("The number of groups must be greater than zero.");
  //   }

  //   const groupSize = Math.ceil(this.length / numGroups);
  //   const result: Collection<T>[] = [];

  //   for (let i = 0; i < this.length; i += groupSize) {
  //     result.push(new Collection(this.slice(i, i + groupSize)));
  //   }

  //   return result;
  // }

  // splitIn(numGroups: number): Collection<T>[] {
  //   if (numGroups <= 0) {
  //     throw new Error("The number of groups must be greater than zero.");
  //   }

  //   const minGroupSize = Math.floor(this.length / numGroups);
  //   const remainder = this.length % numGroups;
  //   const result: Collection<T>[] = [];

  //   let start = 0;
  //   for (let i = 0; i < numGroups; i++) {
  //     const groupSize = minGroupSize + (i < remainder ? 1 : 0);
  //     result.push(new Collection(this.slice(start, start + groupSize)));
  //     start += groupSize;
  //   }

  //   return result;
  // }

  // sum(keyOrCallback?: keyof T | ((item: T) => number)): number {
  //   if (this.length === 0) return 0;

  //   return this.reduce((acc, item: any) => {
  //     let value: number = 0;

  //     if (typeof keyOrCallback === "function") {
  //       // If a callback function is provided, call it with the item
  //       value = keyOrCallback(item);
  //     } else if (
  //       typeof keyOrCallback === "string" &&
  //       typeof item === "object" &&
  //       item[keyOrCallback] !== undefined
  //     ) {
  //       // If a key is provided, extract the value from the object
  //       const extractedValue = item[keyOrCallback];
  //       if (typeof extractedValue === "number") {
  //         value = extractedValue;
  //       }
  //     } else if (typeof item === "number" && keyOrCallback === undefined) {
  //       // If no key or callback is provided, sum up the numbers directly
  //       value = item;
  //     }

  //     return acc + value;
  //   }, 0);
  // }

  // take(limit: number): Collection<T> {
  //   if (limit === 0) return new Collection([]);
  //   if (limit > 0) return new Collection(this.slice(0, limit));
  //   return new Collection(this.slice(limit)); // Negative limit → take from the end
  // }

  // takeUntil(callback: (item: T) => boolean): Collection<T> {
  //   const index = this.findIndex(callback);
  //   return new Collection(index === -1 ? this : this.slice(0, index));
  // }

  // takeWhile(callback: (item: T) => boolean): Collection<T> {
  //   const index = this.findIndex((item) => !callback(item));
  //   return new Collection(index === -1 ? this : this.slice(0, index));
  // }

  // transform(callback: (item: T, index: number) => T): this {
  //   this.forEach((item, index) => {
  //     this[index] = callback(item, index);
  //   });
  //   return this;
  // }

  // unique(): Collection<T>;
  // unique<K extends keyof T>(key: K): Collection<T>;
  // unique(callback: (item: T) => any): Collection<T>;
  // unique(param?: keyof T | ((item: T) => any)): Collection<T> {
  //   const seen = new Set();

  //   const filtered = this.filter((item) => {
  //     const value =
  //       typeof param === "function"
  //         ? param(item)
  //         : param
  //         ? (item as any)[param]
  //         : item;
  //     if (seen.has(value)) return false;
  //     seen.add(value);
  //     return true;
  //   });

  //   return new Collection(filtered);
  // }

  // value<K extends keyof T>(key: K): T[K] | undefined {
  //   if (this.length === 0) return undefined;
  //   return this[0][key];
  // }

  // where<K extends keyof T>(
  //   keyOrCallback: K | ((item: T) => boolean),
  //   operatorOrValue?: string | T[K],
  //   value?: T[K]
  // ): Collection<T> {
  //   // If keyOrCallback is a function, treat it as a filter function
  //   if (typeof keyOrCallback === "function") {
  //     return new Collection(this.filter(keyOrCallback));
  //   }

  //   // Determine if the second parameter is a value or an operator
  //   let operator: string;
  //   let actualValue: any;

  //   if (value === undefined) {
  //     // If only two parameters are provided, assume "=" as the default operator
  //     operator = "=";
  //     actualValue = operatorOrValue as T[K];
  //   } else {
  //     // If three parameters are provided, the second one is an operator
  //     operator = operatorOrValue as string;
  //     actualValue = value;
  //   }

  //   // Find corresponding MongoDB operator
  //   const operatorMapping = operators.find((op) => op.operator === operator);
  //   if (!operatorMapping) {
  //     throw new Error(`Unsupported operator: ${operator}`);
  //   }

  //   return new Collection(
  //     this.filter((item) => {
  //       const itemValue = item[keyOrCallback];
  //       return this.compare(
  //         itemValue,
  //         operatorMapping.mongoOperator,
  //         actualValue,
  //         operatorMapping.options
  //       );
  //     })
  //   );
  // }

  // whereBetween<K extends keyof T>(key: K, range: [T[K], T[K]]): Collection<T> {
  //   const [min, max] = range;

  //   return new Collection(
  //     this.filter((item) => {
  //       const value = item[key];
  //       return value >= min && value <= max;
  //     })
  //   );
  // }

  // whereIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
  //   return new Collection(this.filter((item) => values.includes(item[key])));
  // }

  // whereNotBetween<K extends keyof T>(
  //   key: K,
  //   range: [T[K], T[K]]
  // ): Collection<T> {
  //   const [min, max] = range;
  //   return new Collection(
  //     this.filter((item) => item[key] < min || item[key] > max)
  //   );
  // }

  // whereNotIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
  //   return new Collection(this.filter((item) => !values.includes(item[key])));
  // }

  // whereNotNull<K extends keyof T>(key: K): Collection<T> {
  //   return new Collection(
  //     this.filter((item) => item[key] !== null && item[key] !== undefined)
  //   );
  // }

  // whereNull<K extends keyof T>(key: K): Collection<T> {
  //   return new Collection(this.filter((item) => item[key] === null));
  // }

  // private compare(
  //   a: any,
  //   mongoOperator: string,
  //   b: any,
  //   options?: string
  // ): boolean {
  //   switch (mongoOperator) {
  //     case "eq":
  //       return a === b;
  //     case "ne":
  //       return a !== b;
  //     case "gt":
  //       return a > b;
  //     case "lt":
  //       return a < b;
  //     case "gte":
  //       return a >= b;
  //     case "lte":
  //       return a <= b;
  //     case "in":
  //       return Array.isArray(b) && b.includes(a);
  //     case "nin":
  //       return Array.isArray(b) && !b.includes(a);
  //     case "regex":
  //       return typeof a === "string" && new RegExp(b, options).test(a);
  //     default:
  //       throw new Error(`Unsupported MongoDB operator: ${mongoOperator}`);
  //   }
  // }
}
