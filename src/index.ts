/**
 * @module Mongoloquent
 * @description A MongoDB ODM (Object Document Mapper) with an eloquent-style API
 */
import "dotenv/config";

import Collection from "./Collection";

export * from "./interfaces/ISchema";

/**
 * Base Model class for document mapping
 * @export
 * @class Model
 * @template T - Type of the document data
 */
export { default as Model } from "./Model";

/**
 * Collection class for working with arrays of documents
 * @export
 * @class Collection
 * @template T - Type of items in the collection
 */
export { Collection };

/**
 * Query builder for MongoDB operations with a fluent API
 * @export
 * @class QueryBuilder
 * @template T - Type of the document being queried
 */
export { default as QueryBuilder } from "./QueryBuilder";

/**
 * Database connection and management utilities
 * @export
 * @namespace DB
 */
export { default as DB } from "./DB";

/**
 * Creates a new collection instance from an array of values
 * @export
 * @template T - Type of items to collect
 * @param {T[]} values - Array of values to wrap in a Collection
 * @returns {Collection<T>} A new Collection instance containing the provided values
 */
export function collect<T>(values: T[]) {
  return new Collection<T>(...values);
}
