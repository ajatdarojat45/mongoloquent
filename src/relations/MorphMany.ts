import { Document } from "mongodb";
import { IRelationMorphMany } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";

export default class MorphMany extends LookupBuilder {
  /**
   * Generates the lookup, select, and exclude stages for the MorphMany relation.
   * @param {IRelationMorphMany} morphMany - The MorphMany relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(morphMany: IRelationMorphMany): Document[] {
    // Generate the lookup stages for the MorphMany relationship
    const alias = morphMany.alias || "alias";
    const lookup = this.lookup(morphMany);

    // Generate the select stages if options.select is provided
    if (morphMany.options?.select) {
      const select = this.select(morphMany.options.select, alias);
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (morphMany.options?.exclude) {
      const exclude = this.exclude(morphMany.options.exclude, alias);
      lookup.push(...exclude);
    }

    // Generate the sort stages if options.sort is provided
    if (morphMany.options?.sort) {
      const sort = this.sort(
        morphMany.options?.sort[0],
        morphMany.options?.sort[1]
      );
      lookup.push(sort);
    }

    // Generate the skip stages if options.skip is provided
    if (morphMany.options?.skip) {
      const skip = this.skip(morphMany.options?.skip);
      lookup.push(skip);
    }

    // Generate the limit stages if options.limit is provided
    if (morphMany.options?.limit) {
      const limit = this.limit(morphMany.options?.limit);
      lookup.push(limit);
    }

    // Return the combined lookup, select, and exclude stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the MorphMany relation.
   * @param {IRelationMorphMany} morphMany - The MorphMany relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphMany: IRelationMorphMany): Document[] {
    const lookup: Document[] = [{ $project: { alias: 0 } }];
    const pipeline: Document[] = [];
    const alias = morphMany.alias || "alias";

    // Add soft delete condition to the pipeline if enabled
    if (morphMany.model["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${morphMany.relatedModel.getIsDeleted()}`, false] },
              {
                $eq: [
                  `$${morphMany.morphType}`,
                  morphMany.model.constructor.name,
                ],
              },
            ],
          },
        },
      });
    } else {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  `$${morphMany.morphType}`,
                  morphMany.model.constructor.name,
                ],
              },
            ],
          },
        },
      });
    }

    // Define the $lookup stage
    const $lookup = {
      from: morphMany.relatedModel["$collection"],
      localField: "_id",
      foreignField: morphMany.morphId,
      as: alias,
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({ $lookup });

    return lookup;
  }
}
