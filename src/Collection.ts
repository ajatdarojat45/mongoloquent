import {
  MongoloquentInvalidArgumentException,
  MongoloquentInvalidOperatorException,
  MongoloquentItemNotFoundException,
  MongoloquentMultipleItemsFoundException,
} from "./exceptions/MongoloquentException";
import operators from "./utils/operators";

/**
 * Collection class that extends Array to provide additional functionality for working with arrays of items
 * @class Collection
 * @extends Array
 * @template T - The type of items in the collection
 */
export default class Collection<T> extends Array<T> {
  /**
   * Creates a new Collection instance
   * @param {...T} args - The items to initialize the collection with
   */
  constructor(...args: T[]) {
    super(...args);
  }

  /**
   * Returns the item that comes after the first item that matches the given key/value pair or callback
   * @param {keyof T | ((item: T) => boolean)} keyOrCallback - The key to match against or a callback function
   * @param {any} [value] - The value to match (only used when keyOrCallback is a key)
   * @param {boolean} [strict=true] - Whether to use strict equality comparison
   * @returns {T | null} The next item in the collection or null if not found
   */
  after(
    keyOrCallbackOrValue: keyof T | ((item: T) => boolean) | any,
    value?: any,
    strict: boolean = false,
  ): T | null {
    // Case 1: Direct value comparison (e.g., after(3))
    if (arguments.length === 1 && typeof keyOrCallbackOrValue !== "function") {
      const index = this.findIndex((item) =>
        strict ? item === keyOrCallbackOrValue : item == keyOrCallbackOrValue,
      );

      console.log(index);

      return index !== -1 && index + 1 < this.length ? this[index + 1] : null;
    }

    // Case 2: Function callback (e.g., after(value => value > 5))
    if (typeof keyOrCallbackOrValue === "function") {
      const index = this.findIndex(keyOrCallbackOrValue);
      return index !== -1 && index + 1 < this.length ? this[index + 1] : null;
    }

    // Case 3: Key-value pair (e.g., after("foo", 3))
    const index = this.findIndex((item) =>
      strict
        ? item[keyOrCallbackOrValue as keyof T] === value
        : item[keyOrCallbackOrValue as keyof T] == value,
    );
    return index !== -1 && index + 1 < this.length ? this[index + 1] : null;
  }

  /**
   * Returns all items in the collection
   * @returns {T[]} A copy of all items in the collection
   */
  all(): T[] {
    return this;
  }

  /**
   * Alias for avg() method
   * @param {keyof T | ((item: T) => number)} keyOrCallback - The key to average or a callback function
   * @returns {number | null} The average value or null if collection is empty
   */
  average(keyOrCallback?: keyof T | ((item: T) => number)): number | null {
    return this.avg(keyOrCallback);
  }

  /**
   * Calculates the average value of a given key or callback result
   * @param {keyof T | ((item: T) => number)} [keyOrCallback] - The key to average or a callback function
   * @returns {number | null} The average value or null if collection is empty
   */
  avg(keyOrCallback?: keyof T | ((item: T) => number)): number | null {
    if (this.length === 0) return null;

    // When no parameter is provided (e.g., for arrays of numbers)
    if (keyOrCallback === undefined) {
      const sum = this.reduce((total, item) => {
        return total + (typeof item === "number" ? item : 0);
      }, 0);
      return sum / this.length;
    }

    // When key or callback is provided
    const sum = this.reduce((total, item) => {
      const value =
        typeof keyOrCallback === "function"
          ? keyOrCallback(item)
          : (item[keyOrCallback as keyof T] as unknown as number);

      return total + (typeof value === "number" ? value : 0);
    }, 0);

    return sum / this.length;
  }

  /**
   * Returns the item that comes before the first item that matches the given key/value pair or callback
   * @param {keyof T | ((item: T) => boolean) | any} keyOrCallbackOrValue - The key to match against, a callback function, or a direct value
   * @param {any} [value] - The value to match (only used when keyOrCallbackOrValue is a key)
   * @param {boolean} [strict=true] - Whether to use strict equality comparison
   * @returns {T | null} The previous item in the collection or null if not found
   */
  before(
    keyOrCallbackOrValue: keyof T | ((item: T) => boolean) | any,
    value?: any,
    strict: boolean = true,
  ): T | null {
    // Case 1: Direct value comparison (e.g., before(3))
    if (arguments.length === 1 && typeof keyOrCallbackOrValue !== "function") {
      const index = this.findIndex((item) => item === keyOrCallbackOrValue);
      return index > 0 ? this[index - 1] : null;
    }

    // Case 2: Function callback (e.g., before(value => value > 5))
    if (typeof keyOrCallbackOrValue === "function") {
      const index = this.findIndex(keyOrCallbackOrValue);
      return index > 0 ? this[index - 1] : null;
    }

    // Case 3: Key-value pair (e.g., before("foo", 3))
    const index = this.findIndex((item) =>
      strict
        ? item[keyOrCallbackOrValue as keyof T] === value
        : item[keyOrCallbackOrValue as keyof T] == value,
    );
    return index > 0 ? this[index - 1] : null;
  }

  /**
   * Splits the collection into chunks of the specified size
   * @param {number} size - The size of each chunk
   * @returns {Collection<T[]>} A new collection containing arrays of chunked items
   */
  chunk(size: number): Collection<T[]> {
    if (size <= 0) return new Collection();

    const chunks: T[][] = [];
    for (let i = 0; i < this.length; i += size) {
      chunks.push(this.slice(i, i + size));
    }

    return new Collection(...chunks);
  }

  /**
   * Converts the collection into a new Collection instance
   * @returns {Collection<T>} A new Collection instance containing the same items
   */
  collect(): Collection<T> {
    return new Collection(...this);
  }

  /**
   * Concatenates the current collection with the given items
   * @param {T[] | Collection<T>} items - The items to concatenate
   * @returns {Collection<T>} A new Collection instance containing the concatenated items
   */
  concat(items: T[] | Collection<T>): Collection<T> {
    return new Collection(...this, ...items);
  }

  /**
   * Checks if the collection contains an item that matches the given key/value pair, callback, or direct value
   * @param {keyof T | ((item: T) => boolean) | any} keyOrCallbackOrValue - The key to match against, a callback function, or a direct value
   * @param {any} [value] - The value to match (only used when keyOrCallbackOrValue is a key)
   * @returns {boolean} True if the collection contains a matching item, false otherwise
   */
  contains(
    keyOrCallbackOrValue: keyof T | ((item: T) => boolean) | any,
    value?: any,
  ): boolean {
    // Case 1: Function callback (e.g., contains(item => item > 5))
    if (typeof keyOrCallbackOrValue === "function") {
      return this.some(keyOrCallbackOrValue);
    }

    // Case 2: Key-value pair (e.g., contains("name", "Desk"))
    if (arguments.length === 2) {
      return this.some(
        (item) =>
          item &&
          typeof item === "object" &&
          item[keyOrCallbackOrValue as keyof T] == value,
      );
    }

    // Case 3: Direct value comparison (e.g., contains("Desk"))
    return this.some((item) => {
      // Check if the item itself equals the value
      if (item == keyOrCallbackOrValue || item == keyOrCallbackOrValue) {
        return true;
      }

      // Check if any property of the object equals the value
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

  /**
   * Checks if the collection contains an item that matches the given key/value pair, callback, or direct value
   * @param {keyof T | ((item: T) => boolean) | any} keyOrCallbackOrValue - The key to match against, a callback function, or a direct value
   * @param {any} [value] - The value to match (only used when keyOrCallbackOrValue is a key)
   * @returns {boolean} True if the collection contains a matching item, false otherwise
   */
  containsStrict(
    keyOrCallbackOrValue: keyof T | ((item: T) => boolean) | any,
    value?: any,
  ): boolean {
    // Case 1: Function callback (e.g., contains(item => item > 5))
    if (typeof keyOrCallbackOrValue === "function") {
      return this.some(keyOrCallbackOrValue);
    }

    // Case 2: Key-value pair (e.g., contains("name", "Desk"))
    if (arguments.length === 2) {
      return this.some(
        (item) =>
          item &&
          typeof item === "object" &&
          item[keyOrCallbackOrValue as keyof T] === value,
      );
    }

    // Case 3: Direct value comparison (e.g., contains("Desk"))
    return this.some((item) => {
      // Check if the item itself equals the value
      if (item === keyOrCallbackOrValue || item === keyOrCallbackOrValue) {
        return true;
      }

      // Check if any property of the object equals the value
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

  /**
   * Returns the number of items in the collection
   * @returns {number} The number of items in the collection
   */
  count(): number {
    return this.length;
  }

  /**
   * Counts the occurrences of each unique value in the collection
   * @param {(item: T) => any} [callback] - A callback function to determine the value to count
   * @returns {Collection<Record<string, number>>} A Collection containing an object with counts of each unique value
   */
  countBy(callback?: (item: T) => any): Collection<Record<string, number>> {
    const result: Record<string, number> = {};

    this.forEach((item) => {
      const key = callback ? callback(item) : (item as any);
      const keyStr = String(key);

      result[keyStr] = (result[keyStr] || 0) + 1;
    });

    return new Collection(result);
  }

  /**
   * Checks if the collection does not contain an item that matches the given predicate or key/value pair
   * @param {((item: T) => boolean) | string | any} predicateOrValueOrKey - A callback function, value, or key to match against
   * @param {any} [value] - The value to match (only used for key-value pairs)
   * @returns {boolean} True if the collection does not contain a matching item, false otherwise
   */
  doesntContain(
    predicateOrValueOrKey: ((item: T) => boolean) | string | any,
    value?: any,
  ): boolean {
    // Case 1: Function callback (e.g., doesntContain(value => value < 5))
    if (typeof predicateOrValueOrKey === "function") {
      return !this.some(predicateOrValueOrKey);
    }

    // Case 2: Key-value pair (e.g., doesntContain("product", "Bookcase"))
    if (arguments.length === 2) {
      return !this.some(
        (item) =>
          item &&
          typeof item === "object" &&
          item[predicateOrValueOrKey as keyof T] === value,
      );
    }

    // Case 3: Direct value comparison (e.g., doesntContain("Desk"))
    return !this.some((item) => {
      // Check if the item itself equals the value
      if (item === predicateOrValueOrKey) {
        return true;
      }

      // Check if any property of the object equals the value
      if (item && typeof item === "object") {
        return Object.values(item).some(
          (propValue) => propValue === predicateOrValueOrKey,
        );
      }

      return false;
    });
  }

  /**
   * Finds duplicate values in the collection
   * @param {keyof T} [key] - The key to check for duplicates (only for collections of objects)
   * @returns {Record<number, any>} An object with indices as keys and duplicate values
   */
  duplicates(key?: keyof T): Record<number, any> {
    const result: Record<number, any> = {};
    const seen = new Set<any>();

    // First pass: collect all unique values
    this.forEach((item) => {
      const value = key !== undefined ? item[key] : item;
      seen.add(value);
    });

    // Second pass: track which values we've already found as duplicates
    const alreadyAddedDuplicates = new Set<any>();

    // Third pass: identify duplicates that appear second time or later
    this.forEach((item, index) => {
      const value = key !== undefined ? item[key] : item;

      // If we've seen this value before but haven't added it as a duplicate yet
      if (seen.has(value) && !alreadyAddedDuplicates.has(value)) {
        // Mark that we've found this value as a duplicate
        alreadyAddedDuplicates.add(value);
      }
      // If we've already identified this as a duplicate and we're not on the first occurrence
      else if (alreadyAddedDuplicates.has(value)) {
        result[index] = value;
      }
    });

    return result;
  }

  /**
   * Iterates over each item in the collection and executes the callback function
   * @param {(item: T, index: number, collection: this) => boolean | void} callback - The callback function to execute
   * @returns {this} The current collection instance
   */
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

  /**
   * Checks if every item in the collection matches the given callback or key/value pair
   * @param {((item: T, index: number, collection: this) => boolean) | string} callbackOrKey - A callback function or key to match against
   * @param {any} [value] - The value to match (only used when callbackOrKey is a key)
   * @returns {boolean} True if every item matches, false otherwise
   */
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

  /**
   * Removes the specified keys from each item in the collection
   * @param {keyof T | (keyof T)[] | string | string[]} keys - The keys to remove
   * @returns {Collection<T>} A new collection with the keys removed
   */
  except(keys: keyof T | (keyof T)[] | string | string[]): Collection<T> {
    const keysArray: (keyof T | string)[] = Array.isArray(keys) ? keys : [keys];

    return new Collection(
      ...this.map((item: any) => {
        if (typeof item !== "object" || item === null) {
          return item;
        }

        // Create a new object with only the keys we want to keep
        const newItem = { ...item };
        keysArray.forEach((key) => {
          delete newItem[key as keyof object];
        });

        return newItem;
      }),
    );
  }

  /**
   * Returns the first item in the collection that matches the given predicate
   * @param {(item: T, index: number, collection: this) => boolean} [predicate] - A callback function to match against
   * @returns {T | null} The first matching item or null if not found
   */
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

  /**
   * Returns the first item in the collection that matches the given predicate or throws an exception if not found
   * @param {(item: T, index: number, collection: this) => boolean} [predicate] - A callback function to match against
   * @returns {T} The first matching item
   * @throws {MongoloquentItemNotFoundException} If no matching item is found
   */
  firstOrFail(
    predicate?: (item: T, index: number, collection: this) => boolean,
  ): T {
    if (!predicate) {
      if (this.length > 0) {
        return this[0];
      }
      throw new MongoloquentItemNotFoundException();
    }

    for (let i = 0; i < this.length; i++) {
      if (predicate(this[i], i, this)) {
        return this[i];
      }
    }

    throw new MongoloquentItemNotFoundException();
  }

  /**
   * Returns the first item in the collection that matches the given key/operator/value condition
   * @param {keyof T} key - The key to match against
   * @param {string | T[K]} [operator] - The operator to use for comparison or the value to compare against
   * @param {any} [value] - The value to compare against (only when operator is a string operator)
   * @returns {T | null} The first matching item or null if not found
   * @throws {MongoloquentInvalidOperatorException} If the operator is invalid
   */
  firstWhere<K extends keyof T>(
    key: K,
    operator?: string | T[K],
    value?: any,
  ): T | null {
    // Case 1: firstWhere("key") - Find first item where the key has a truthy value
    if (operator === undefined) {
      for (const item of this) {
        if (item[key]) {
          return item;
        }
      }
      return null;
    }

    // Case 2: firstWhere("key", value) - Find first item where key equals value
    if (value === undefined) {
      value = operator as T[K];
      operator = "=";
    }

    // Find the operator in the operators array
    const op = operators.find(
      (o) => o.operator === operator || o.mongoOperator === operator,
    );
    if (!op) {
      throw new MongoloquentInvalidOperatorException();
    }

    // Find the first item that matches the condition
    for (const item of this) {
      if (this.compare(item[key], op.mongoOperator, value, op.options)) {
        return item;
      }
    }

    return null;
  }

  /**
   * Removes the specified keys from each item in the collection
   * @param {keyof T | (keyof T)[]} keys - The keys to remove
   * @returns {this} The current collection instance
   */
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

  /**
   * Returns a subset of the collection for the specified page and items per page
   * @param {number} page - The page number (1-based)
   * @param {number} perPage - The number of items per page
   * @returns {Collection<T>} A new collection containing the items for the specified page
   * @throws {Error} If page or perPage is not a positive number
   */
  forPage(page: number, perPage: number): Collection<T> {
    if (page <= 0 || perPage <= 0) {
      throw new Error("Page and perPage must be positive numbers.");
    }
    const start = (page - 1) * perPage;
    return new Collection(...this.slice(start, start + perPage));
  }

  /**
   * Retrieves the value of the specified key from the first item in the collection
   * @param {string} key - The key to retrieve
   * @param {T | (() => T) | null} [defaultValue=null] - The default value to return if the key is not found
   * @returns {any} The value of the key or the default value
   */
  get(key: string, defaultValue: any = null): any {
    const item = this[0] as any;

    if (item && key in item) {
      return item[key];
    }

    return typeof defaultValue === "function"
      ? (defaultValue as () => any)()
      : defaultValue;
  }

  /**
   * Groups the items in the collection by the specified key or callback
   * @param {string | ((item: T) => any)} keyOrCallback - The key to group by or a callback function
   * @returns {Collection<Record<string, T[]>>} A new collection containing the grouped items
   */
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

  /**
   * Checks if the collection contains items with the specified keys
   * @param {string | string[]} keys - The keys to check for
   * @returns {boolean} True if the collection contains items with the specified keys, false otherwise
   */
  has(keys: string | string[]): boolean {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    return keys.every((key) =>
      this.some((item) => Object.prototype.hasOwnProperty.call(item, key)),
    );
  }

  /**
   * Checks if the collection contains items with any of the specified keys
   * @param {string | string[]} keys - The keys to check for
   * @returns {boolean} True if the collection contains items with any of the specified keys, false otherwise
   */
  hasAny(keys: string | string[]): boolean {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    return keys.some((key) =>
      this.some((item) => Object.prototype.hasOwnProperty.call(item, key)),
    );
  }

  /**
   * Joins the values of the collection into a string
   * @param {string | ((item: T) => any)} keyOrGlue - The key to join or the glue string
   * @param {string} [glue] - The string to use as a separator
   * @returns {string} The joined string
   */
  implode(keyOrGlue: string | ((item: T) => any), glue?: string): string {
    // Case 1: Callback function to extract values before joining
    if (typeof keyOrGlue === "function") {
      return this.map(keyOrGlue).join(glue ?? "");
    }

    // Case 2: Array of objects with a key to extract values from
    if (glue !== undefined && typeof this[0] === "object") {
      return this.map((item) => (item as any)?.[keyOrGlue] ?? "").join(glue);
    }

    // Case 3: Array of primitives, keyOrGlue is actually the glue
    return this.join(keyOrGlue);
  }

  /**
   * Checks if the collection is empty
   * @returns {boolean} True if the collection is empty, false otherwise
   */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Checks if the collection is not empty
   * @returns {boolean} True if the collection is not empty, false otherwise
   */
  isNotEmpty(): boolean {
    return this.length > 0;
  }

  /**
   * Creates a new object with items keyed by the specified key or callback result
   * @param {string | ((item: T) => string)} keyOrCallback - The key to use for organizing or a callback function
   * @returns {Record<string, T>} An object with items keyed by the specified key or callback result
   */
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

  /**
   * Returns the last item in the collection that matches the given predicate
   * @param {(item: T) => boolean} [predicate] - A callback function to match against
   * @returns {T | null} The last matching item or null if not found
   */
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

  /**
   * Creates a new collection instance with the specified items
   * @param {...U} items - The items to include in the new collection
   * @returns {Collection<U>} A new collection instance
   */
  static make<U>(items: U[]): Collection<U> {
    return new Collection(...items);
  }

  /**
   * Finds the maximum value in the collection based on the specified key
   * @param {keyof T} [key] - The key to find the maximum value for
   * @returns {number | null} The maximum value or null if the collection is empty
   */
  max(key?: keyof T): number | null {
    if (this.length === 0) return null;

    if (!key) {
      return Math.max(...(this as unknown as number[]));
    }

    return Math.max(
      ...this.map((item) => (item[key] as unknown as number) || 0),
    );
  }

  /**
   * Finds the median value in the collection based on the specified key
   * @param {keyof T} [key] - The key to find the median value for
   * @returns {number | null} The median value or null if the collection is empty
   */
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

  /**
   * Finds the minimum value in the collection based on the specified key
   * @param {keyof T} [key] - The key to find the minimum value for
   * @returns {number | null} The minimum value or null if the collection is empty
   */
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

  /**
   * Multiplies the collection by the specified number of times
   * @param {number} times - The number of times to multiply the collection
   * @returns {Collection<T>} A new collection containing the multiplied items
   */
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

  /**
   * Returns a new collection containing every nth item in the collection
   * @param {number} step - The step size
   * @param {number} [offset=0] - The offset to start from
   * @returns {Collection<T>} A new collection containing every nth item
   */
  nth(step: number, offset: number = 0): Collection<T> {
    if (step <= 0) return new Collection(...[]);
    return new Collection(
      ...this.filter((_, index) => (index - offset) % step === 0),
    );
  }

  /**
   * Returns a new collection containing only the specified keys from each item
   * @param {string[]} keys - The keys to include
   * @returns {Collection<Partial<T>>} A new collection containing only the specified keys
   */
  only(keys: string[]): Collection<Partial<T>> {
    if (!Array.isArray(this)) return new Collection(...[]);

    return new Collection(
      ...this.map((item) => {
        if (typeof item !== "object" || item === null) return item;
        return Object.keys(item)
          .filter((key) => keys.includes(key))
          .reduce((acc: any, key) => {
            acc[key] = (item as any)[key];
            return acc;
          }, {} as Partial<T>);
      }),
    );
  }

  /**
   * Extracts the values of the specified fields from each item in the collection
   * @param {keyof T} field - The field to extract
   * @returns {Collection<T[keyof T]>} A new collection containing the extracted values
   */
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

  /**
   * Removes the specified key from each object in the collection
   * @param {string} key - The key to remove
   * @returns {Collection<T>} The updated collection with the key removed
   */
  pull(key: string): Collection<T> {
    // Create a new collection with the specified key removed from each object
    return new Collection(
      ...this.map((item: any) => {
        if (typeof item !== "object" || item === null) {
          return item;
        }

        // Create a shallow copy to avoid mutating the original object
        const newItem = { ...item };
        // Remove the specified key
        delete newItem[key];

        return newItem;
      }),
    );
  }

  /**
   * Returns a random item or a collection of random items from the collection
   * @param {number | ((collection: Collection<T>) => any)} [count] - The number of random items to return or a callback function
   * @returns {T | Collection<T>} A random item or a collection of random items
   * @throws {MongoloquentInvalidArgumentException} If count is invalid
   */
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
      throw new MongoloquentInvalidArgumentException();
    }

    const shuffled = [...this].sort(() => 0.5 - Math.random());
    return new Collection(...shuffled.slice(0, count));
  }

  /**
   * Filters the collection to include items within the specified range
   * @param {keyof T} key - The key to filter by
   * @param {[number, number]} range - The range to include
   * @returns {Collection<T>} A new collection containing items within the range
   */
  range(key: keyof T, range: [number, number]): Collection<T> {
    const [min, max] = range;
    return new Collection(
      ...this.filter((item) => {
        const value = item[key];
        return typeof value === "number" && value >= min && value <= max;
      }),
    );
  }

  /**
   * Searches the collection for an item that matches the given key/value pair or callback
   * @param {keyof T | ((item: T) => boolean)} keyOrCallback - The key to match against or a callback function
   * @param {any} value - The value to match
   * @param {boolean} [strict=false] - Whether to use strict equality comparison
   * @returns {number | string | false} The index or key of the matching item, or false if not found
   */
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

  /**
   * Selects the specified keys from each item in the collection
   * @param {string | string[]} keys - The keys to select
   * @returns {Collection<Partial<T>>} A new collection containing the selected keys
   */
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

  /**
   * Shuffles the items in the collection
   * @returns {Collection<T>} A new collection containing the shuffled items
   */
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

  /**
   * Skips the first n items in the collection
   * @param {number} n - The number of items to skip
   * @returns {Collection<T>} A new collection containing the remaining items
   */
  skip(n: number): Collection<T> {
    const skippedItems = this.slice(n);
    return new Collection(...skippedItems);
  }

  /**
   * Skips items in the collection until the callback condition is met
   * @param {(item: T) => boolean} [callback] - A callback function to determine when to stop skipping
   * @returns {Collection<T>} A new collection containing the remaining items
   */
  skipUntil(callback?: (item: T) => boolean): Collection<T> {
    // If no callback is provided, return an empty collection
    if (!callback) {
      return new Collection();
    }

    let found = false;
    const result = [];

    for (const item of this) {
      // Check if this item matches the condition to stop skipping
      if (!found && callback(item)) {
        found = true;
      }

      // If we've found a match, include this and all subsequent items
      if (found) {
        result.push(item);
      }
    }

    return new Collection(...result);
  }

  skipWhile(callback?: (item: T) => boolean): Collection<T> {
    // If no callback is provided, return an empty collection
    if (!callback) {
      return new Collection();
    }

    let index = 0;

    // Find the first item that doesn't satisfy the condition
    for (let i = 0; i < this.length; i++) {
      if (!callback(this[i])) {
        index = i;
        break;
      }

      // If all items satisfy the condition, return empty collection
      if (i === this.length - 1) {
        return new Collection();
      }
    }

    // Return all items starting from the index where the condition became false
    console.log(...this.slice(index));
    return new Collection(...this.slice(index));
  }

  /**
   * Creates sliding windows of the specified size and step
   * @param {number} size - The size of each window
   * @param {number} [step=1] - The step size between windows
   * @returns {Collection<T[]>} A new collection containing the sliding windows
   * @throws {MongoloquentInvalidArgumentException} If size or step is invalid
   */
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

  /**
   * Returns the sole item in the collection that matches the given key/value pair or callback
   * @param {keyof T | ((item: T) => boolean)} [key] - The key to match against or a callback function
   * @param {any} [value] - The value to match
   * @returns {T} The sole matching item
   * @throws {MongoloquentItemNotFoundException} If no matching item is found
   * @throws {MongoloquentMultipleItemsFoundException} If multiple matching items are found
   */
  sole(key?: keyof T | ((item: T) => boolean), value?: any): T {
    if (!key) {
      if (this.length === 1) {
        return this[0];
      }
      throw new MongoloquentItemNotFoundException();
    }

    if (value !== undefined) {
      const matchedItems = this.filter((item: any) => item[key] === value);
      if (matchedItems.length === 1) {
        return matchedItems[0];
      } else if (matchedItems.length === 0) {
        throw new MongoloquentItemNotFoundException();
      } else {
        throw new MongoloquentMultipleItemsFoundException();
      }
    }

    if (typeof key === "function") {
      const matchedItems = this.filter(key);
      if (matchedItems.length === 1) {
        return matchedItems[0];
      } else if (matchedItems.length === 0) {
        throw new MongoloquentItemNotFoundException();
      } else {
        throw new MongoloquentMultipleItemsFoundException();
      }
    }

    throw new MongoloquentItemNotFoundException();
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
      // Handle the case where the callback takes a single argument and returns a value to sort by
      if (keyOrCallback.length === 1) {
        sortedArray.sort((a, b) => {
          const valueA = (keyOrCallback as (item: T) => any)(a);
          const valueB = (keyOrCallback as (item: T) => any)(b);

          if (valueA > valueB) return direction === "asc" ? 1 : -1;
          if (valueA < valueB) return direction === "asc" ? -1 : 1;
          return 0;
        });
      } else {
        // Traditional compare function with two arguments
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

  /**
   * Sorts the collection by the specified key or callback in descending order
   * @param {keyof T | ((a: T, b: T) => number) | [keyof T, "asc" | "desc"][]} keyOrCallback - The key or callback to sort by
   * @returns {Collection<T>} A new collection containing the sorted items
   */
  sortByDesc(
    keyOrCallback:
      | keyof T
      | ((a: T, b: T) => number)
      | [keyof T, "asc" | "desc"][],
  ): Collection<T> {
    return this.sortBy(keyOrCallback, "desc");
  }

  /**
   * Sorts the collection in descending order
   * @returns {Collection<T>} A new collection containing the sorted items
   */
  sortDesc(): Collection<T> {
    return new Collection(...this.sort().reverse());
  }

  /**
   * Sorts the collection by keys in ascending order
   * @returns {Collection<T>} A new collection containing the sorted items
   */
  sortKeys(): Collection<T> {
    const sortedEntries = Object.entries(this).sort(([keyA], [keyB]) =>
      keyA.localeCompare(keyB),
    );

    const sortedItems = Object.fromEntries(sortedEntries);
    return new Collection(...Object.values(sortedItems));
  }

  /**
   * Sorts the collection by keys in descending order
   * @returns {Collection<T>} A new collection containing the sorted items
   */
  sortKeysDesc(): Collection<T> {
    const sortedEntries = Object.entries(this).sort(([keyA], [keyB]) =>
      keyB.localeCompare(keyA),
    );

    const sortedItems = Object.fromEntries(sortedEntries);
    return new Collection(...Object.values(sortedItems));
  }

  /**
   * Splits the collection into the specified number of groups
   * @param {number} numGroups - The number of groups to split into
   * @returns {Collection<T>[]} An array of collections, each containing a group of items
   * @throws {MongoloquentInvalidArgumentException} If numGroups is invalid
   */
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

  /**
   * Splits the collection into the specified number of groups with balanced sizes
   * @param {number} numGroups - The number of groups to split into
   * @returns {Collection<T>[]} An array of collections, each containing a group of items
   * @throws {Error} If numGroups is invalid
   */
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

  /**
   * Calculates the sum of the specified key or callback results
   * @param {keyof T | ((item: T) => number)} [keyOrCallback] - The key to sum or a callback function
   * @returns {number} The sum of the values
   */
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

  /**
   * Returns a subset of the collection with the specified number of items
   * @param {number} limit - The number of items to take
   * @returns {Collection<T>} A new collection containing the taken items
   */
  take(limit: number): Collection<T> {
    if (limit === 0) return new Collection();
    if (limit > 0) return new Collection(...this.slice(0, limit));
    return new Collection(...this.slice(limit));
  }

  /**
   * Returns a subset of the collection until the callback condition is met
   * @param {(item: T) => boolean} callback - A callback function to determine when to stop taking
   * @returns {Collection<T>} A new collection containing the taken items
   */
  takeUntil(callbackOrValue: ((item: T) => boolean) | any): Collection<T> {
    let index: number;

    if (typeof callbackOrValue === "function") {
      // Handle function callback case
      index = this.findIndex(callbackOrValue);
    } else {
      // Handle direct value comparison case
      index = this.findIndex((item) => item === callbackOrValue);
    }

    const result = index === -1 ? this : this.slice(0, index);
    return new Collection(...result);
  }

  /**
   * Returns a subset of the collection while the callback condition is true
   * @param {(item: T) => boolean} callback - A callback function to determine when to stop taking
   * @returns {Collection<T>} A new collection containing the taken items
   */
  takeWhile(callbackOrValue: ((item: T) => boolean) | any): Collection<T> {
    let index: number;

    if (typeof callbackOrValue === "function") {
      // Handle function callback case
      index = this.findIndex((item) => !callbackOrValue(item));
    } else {
      // Handle direct value comparison case where we take elements until we encounter the specified value
      index = this.findIndex((item) => item === callbackOrValue);
    }

    const result = index === -1 ? this : this.slice(0, index);
    return new Collection(...result);
  }

  /**
   * Transforms the items in the collection using the callback function
   * @param {(item: T, index: number) => T} callback - A callback function to transform each item
   * @returns {this} The current collection instance
   */
  transform(callback: (item: T, index: number) => T): this {
    this.forEach((item, index) => {
      this[index] = callback(item, index);
    });
    return this;
  }

  /**
   * Returns a new collection containing unique items based on the specified key or callback
   * @param {keyof T | ((item: T) => any)} [param] - The key or callback to determine uniqueness
   * @returns {Collection<T>} A new collection containing unique items
   */
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

  /**
   * Retrieves the value of the specified key from the first item in the collection
   * @param {keyof T} key - The key to retrieve
   * @returns {T[keyof T] | undefined} The value of the key or undefined if not found
   */
  value<K extends keyof T>(key: K): T[K] | undefined {
    if (this.length === 0) return undefined;
    return this[0][key];
  }

  /**
   * Filters the collection to include items that match the specified key/operator/value condition
   * @param {keyof T | ((item: T) => boolean)} keyOrCallback - The key to match against or a callback function
   * @param {string | T[keyof T]} [operatorOrValue] - The operator to use for comparison or the value to match
   * @param {T[keyof T]} [value] - The value to compare against
   * @returns {Collection<T>} A new collection containing the matching items
   * @throws {Error} If the operator is unsupported
   */
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

    const operatorMapping = operators.find(
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

  /**
   * Filters the collection to include items within the specified range
   * @param {keyof T} key - The key to filter by
   * @param {[T[keyof T], T[keyof T]]} range - The range to include
   * @returns {Collection<T>} A new collection containing items within the range
   */
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

  /**
   * Filters the collection to include items with values in the specified array
   * @param {keyof T} key - The key to filter by
   * @param {T[keyof T][]} values - The array of values to include
   * @returns {Collection<T>} A new collection containing items with values in the array
   */
  whereIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(...this.filter((item) => values.includes(item[key])));
  }

  /**
   * Filters the collection to exclude items within the specified range
   * @param {keyof T} key - The key to filter by
   * @param {[T[keyof T], T[keyof T]]} range - The range to exclude
   * @returns {Collection<T>} A new collection containing items outside the range
   */
  whereNotBetween<K extends keyof T>(
    key: K,
    range: [T[K], T[K]],
  ): Collection<T> {
    const [min, max] = range;
    return new Collection(
      ...this.filter((item) => item[key] < min || item[key] > max),
    );
  }

  /**
   * Filters the collection to exclude items with values in the specified array
   * @param {keyof T} key - The key to filter by
   * @param {T[keyof T][]} values - The array of values to exclude
   * @returns {Collection<T>} A new collection containing items without values in the array
   */
  whereNotIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(
      ...this.filter((item) => !values.includes(item[key])),
    );
  }

  /**
   * Filters the collection to include items with non-null values for the specified key
   * @param {keyof T} key - The key to filter by
   * @returns {Collection<T>} A new collection containing items with non-null values
   */
  whereNotNull<K extends keyof T>(key: K): Collection<T> {
    return new Collection(
      ...this.filter((item) => item[key] !== null && item[key] !== undefined),
    );
  }

  /**
   * Filters the collection to include items with null values for the specified key
   * @param {keyof T} key - The key to filter by
   * @returns {Collection<T>} A new collection containing items with null values
   */
  whereNull<K extends keyof T>(key: K): Collection<T> {
    return new Collection(...this.filter((item) => item[key] === null));
  }

  /**
   * Compares two values using the specified MongoDB operator
   * @param {any} a - The first value
   * @param {string} mongoOperator - The MongoDB operator to use for comparison
   * @param {any} b - The second value
   * @param {string} [options] - Additional options for the comparison
   * @returns {boolean} True if the comparison is successful, false otherwise
   * @throws {Error} If the operator is unsupported
   */
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
