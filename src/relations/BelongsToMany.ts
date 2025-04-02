import { Document } from "mongodb";
import { IRelationBelongsToMany } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";

export default class BelongsToMany extends LookupBuilder {
  /**
   * Generates the lookup, select, exclude, sort, skip, and limit stages for the BelongsToMany relation.
   * @param {IRelationBelongsToMany} belongsToMany - The BelongsToMany relation configuration.
   * @return {Document[]} The combined lookup, select, exclude, sort, skip, and limit stages.
   */
  static generate(belongsToMany: IRelationBelongsToMany): Document[] {
    // Generate the lookup stages for the BelongsToMany relationship
    const lookup = this.lookup(belongsToMany);

    // Generate the select stages if options.select is provided
    if (belongsToMany.options?.select) {
      const select = this.select(
        belongsToMany.options.select,
        belongsToMany.alias
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (belongsToMany.options?.exclude) {
      const exclude = this.exclude(
        belongsToMany.options.exclude,
        belongsToMany.alias
      );
      lookup.push(...exclude);
    }

    // Generate the sort stages if options.sort is provided
    if (belongsToMany.options?.sort) {
      const sort = this.sort(
        belongsToMany.options?.sort[0],
        belongsToMany.options?.sort[1]
      );
      lookup.push(sort);
    }

    // Generate the skip stage if options.skip is provided
    if (belongsToMany.options?.skip) {
      const skip = this.skip(belongsToMany.options?.skip);
      lookup.push(skip);
    }

    // Generate the limit stage if options.limit is provided
    if (belongsToMany.options?.limit) {
      const limit = this.limit(belongsToMany.options?.limit);
      lookup.push(limit);
    }

    // Return the combined lookup, select, exclude, sort, skip, and limit stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the BelongsToMany relation.
   * @param {IRelationBelongsToMany} belongsToMany - The BelongsToMany relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(belongsToMany: IRelationBelongsToMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (belongsToMany.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${belongsToMany.relatedModel.getIsDeleted()}`, false] },
            ],
          },
        },
      });
    }

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: belongsToMany.pivotModel["$collection"],
          localField: belongsToMany.parentKey,
          foreignField: belongsToMany.foreignPivotKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: belongsToMany.relatedModel["$collection"],
          localField: `pivot.${belongsToMany.relatedPivotKey}`,
          foreignField: belongsToMany.relatedKey,
          as: belongsToMany.alias || "pivot",
          pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
        },
      }
    );

    return lookup;
  }
}
