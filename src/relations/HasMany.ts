import { Document } from "mongodb";
import { IRelationHasMany } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";

export default class HasMany extends LookupBuilder {
  /**
   * Generates the lookup, select, exclude, sort, skip, and limit stages for the hasMany relation.
   * @param {IRelationHasMany} hasMany - The hasMany relation configuration.
   * @return {Document[]} The combined lookup, select, exclude, sort, skip, and limit stages.
   */
  static generate(hasMany: IRelationHasMany): Document[] {
    // Generate the lookup stages for the hasMany relationship
    const lookup = this.lookup(hasMany);

    // Generate the select stages if options.select is provided
    if (hasMany.options?.select) {
      const select = this.select(hasMany.options.select, hasMany.alias);
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (hasMany.options?.exclude) {
      const exclude = this.exclude(hasMany.options.exclude, hasMany.alias);
      lookup.push(...exclude);
    }

    // Generate the sort stages if options.sort is provided
    if (hasMany.options?.sort) {
      const sort = this.sort(
        hasMany.options?.sort[0],
        hasMany.options?.sort[1]
      );
      lookup.push(sort);
    }

    // Generate the skip stages if options.skip is provided
    if (hasMany.options?.skip) {
      const skip = this.skip(hasMany.options?.skip);
      lookup.push(skip);
    }

    // Generate the limit stages if options.limit is provided
    if (hasMany.options?.limit) {
      const limit = this.limit(hasMany.options?.limit);
      lookup.push(limit);
    }

    // Return the combined lookup, select, exclude, sort, skip, and limit stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the hasMany relation.
   * @param {IRelationHasMany} hasMany - The hasMany relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(hasMany: IRelationHasMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (hasMany.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${hasMany.relatedModel["$isDeleted"]}`, false] }],
          },
        },
      });
    }

    // Define the $lookup stage
    const $lookup = {
      from: hasMany.relatedModel["$collection"],
      localField: hasMany.localKey,
      foreignField: hasMany.foreignKey,
      as: hasMany.alias || "alias",
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({ $lookup });

    // Define the $project stage to exclude the alias field
    lookup.push({
      $project: {
        alias: 0,
      },
    });

    return lookup;
  }
}
