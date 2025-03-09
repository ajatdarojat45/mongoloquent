import { Document } from "mongodb";
import { IRelationMorphToMany } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";

export default class MorphToMany extends LookupBuilder {
  /**
   * Generates the lookup, select, and exclude stages for the MorphToMany relation.
   * @param {IRelationMorphToMany} morphToMany - The MorphToMany relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(morphToMany: IRelationMorphToMany): Document[] {
    // Generate the lookup stages for the MorphToMany relationship
    const lookup = this.lookup(morphToMany);

    // Generate the select stages if options.select is provided
    if (morphToMany.options?.select) {
      const select = this.select(
        morphToMany.options.select,
        morphToMany.alias
      );
      lookup.push(...select)
    }

    // Generate the exclude stages if options.exclude is provided
    if (morphToMany.options?.exclude) {
      const exclude = this.exclude(
        morphToMany.options.exclude,
        morphToMany.alias
      );
      lookup.push(...exclude)
    }

    if (morphToMany.options?.sort) {
      const sort = this.sort(
        morphToMany.options?.sort[0],
        morphToMany.options?.sort[1]
      )
      lookup.push(sort)
    }

    if (morphToMany.options?.skip) {
      const skip = this.skip(morphToMany.options?.skip)
      lookup.push(skip)
    }

    if (morphToMany.options?.limit) {
      const limit = this.limit(morphToMany.options?.limit)
      lookup.push(limit)
    }

    // Return the combined lookup, select, and exclude stages
    return lookup
  }

  /**
   * Generates the lookup stages for the MorphToMany relation.
   * @param {IRelationMorphToMany} morphToMany - The MorphToMany relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphToMany: IRelationMorphToMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (morphToMany.model.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${morphToMany.model.getIsDeleted()}`, false] }],
          },
        },
      });
    }

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: morphToMany.morphCollectionName,
          localField: "_id",
          foreignField: morphToMany.morphId,
          as: "pivot",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        `$${morphToMany.morphType}`,
                        morphToMany.parentModelName,
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
          from: morphToMany.model.$collection,
          localField: `pivot.${morphToMany.foreignKey}`,
          foreignField: "_id",
          as: morphToMany.alias || "alias",
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
