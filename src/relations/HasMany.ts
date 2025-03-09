import { Document } from "mongodb";
import { IRelationHasMany } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";

export default class HasMany extends LookupBuilder {
  /**
   * Generates the lookup, select, and exclude stages for the hasMany relation.
   * @param {IRelationHasMany} hasMany - The hasMany relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(hasMany: IRelationHasMany): Document[] {
    // Generate the lookup stages for the hasMany relationship
    const lookup = this.lookup(hasMany);

    // Generate the select stages if options.select is provided
    if (hasMany.options?.select) {
      const select = this.select(
        hasMany.options.select,
        hasMany.alias
      );
      lookup.push(...select)
    }

    // Generate the exclude stages if options.exclude is provided
    if (hasMany.options?.exclude) {
      const exclude = this.exclude(
        hasMany.options.exclude,
        hasMany.alias
      );
      lookup.push(...exclude)
    }

    if (hasMany.options?.sort) {
      const sort = this.sort(
        hasMany.options?.sort[0],
        hasMany.options?.sort[1]
      )
      lookup.push(sort)
    }

    if (hasMany.options?.skip) {
      const skip = this.skip(hasMany.options?.skip)
      lookup.push(skip)
    }

    if (hasMany.options?.limit) {
      const limit = this.limit(hasMany.options?.limit)
      lookup.push(limit)
    }

    // Return the combined lookup, select, and exclude stages
    return lookup
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
    if (hasMany.model.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${hasMany.model.getIsDeleted()}`, false] }],
          },
        },
      });
    }

    // Define the $lookup stage
    const $lookup = {
      from: hasMany.model.$collection,
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
