/**
 * @module Mongoloquent
 * @description A MongoDB ODM (Object Document Mapper) with an eloquent-style API
 */
import "dotenv/config";

import Model from "./Model";

/**
 * @exports Mongoloquent
 * @description The main export of the Mongoloquent package, providing the base Model class
 * for creating MongoDB models with an eloquent-style interface.
 * @type {typeof Model}
 */
export const Mongoloquent = Model;
