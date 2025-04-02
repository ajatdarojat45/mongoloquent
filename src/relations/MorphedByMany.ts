import { Document } from "mongodb";
import { IRelationMorphedByMany } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";

export default class MorphedByMany extends LookupBuilder {
  /**
   * Generates the lookup, select, exclude, sort, skip, and limit stages for the MorphByMany relation.
   * @param {IRelationMorphedByMany} morphedByMany - The MorphByMany relation configuration.
   * @return {Document[]} The combined lookup, select, exclude, sort, skip, and limit stages.
   */
  static generate(morphedByMany: IRelationMorphedByMany): Document[] {
    // Generate the lookup stages for the MorphByMany relationship
    const lookup = this.lookup(morphedByMany);

    // Generate the select stages if options.select is provided
    if (morphedByMany.options?.select) {
      const select = this.select(
        morphedByMany.options.select,
        morphedByMany.alias
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (morphedByMany.options?.exclude) {
      const exclude = this.exclude(
        morphedByMany.options.exclude,
        morphedByMany.alias
      );
      lookup.push(...exclude);
    }

    // Generate the sort stages if options.sort is provided
    if (morphedByMany.options?.sort) {
      const sort = this.sort(
        morphedByMany.options?.sort[0],
        morphedByMany.options?.sort[1]
      );
      lookup.push(sort);
    }

    // Generate the skip stages if options.skip is provided
    if (morphedByMany.options?.skip) {
      const skip = this.skip(morphedByMany.options?.skip);
      lookup.push(skip);
    }

    // Generate the limit stages if options.limit is provided
    if (morphedByMany.options?.limit) {
      const limit = this.limit(morphedByMany.options?.limit);
      lookup.push(limit);
    }

    // Return the combined lookup, select, exclude, sort, skip, and limit stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the MorphByMany relation.
   * @param {IRelationMorphedByMany} morphedByMany - The MorphByMany relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphedByMany: IRelationMorphedByMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (morphedByMany.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${morphedByMany.relatedModel.getIsDeleted()}`, false] },
            ],
          },
        },
      });
    }

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: morphedByMany.morphCollectionName,
          localField: "_id",
          foreignField: `${morphedByMany.model.constructor.name.toLowerCase()}Id`,
          as: "pivot",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        `$${morphedByMany.morphType}`,
                        morphedByMany.relatedModel.constructor.name,
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: morphedByMany.relatedModel["$collection"],
          localField: `pivot.${morphedByMany.morphId}`,
          foreignField: "_id",
          as: morphedByMany.alias || "alias",
          pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
          alias: 0,
        },
      }
    );

    return lookup;
  }
}
