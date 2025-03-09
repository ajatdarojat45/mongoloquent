import { IRelationBelongsTo } from "../interfaces/IRelation";
import { Document } from "mongodb";
import LookupBuilder from "./LookupBuilder.ts";

export default class BelongsTo extends LookupBuilder {
  /**
   * @note This method defines an inverse one-to-one or many relationship.
   * @param {IRelationBelongsTo} belongsTo - The belongsTo relation details.
   * @return {Document[]} The lookup stages.
   */
  public static generate(belongsTo: IRelationBelongsTo): Document[] {
    // Generate the lookup stages for the belongsTo relationship
    const lookup = this.lookup(belongsTo);

    // Generate the select stages if options.select is provided
    if (belongsTo.options?.select) {
      const select = this.select(
        belongsTo.options.select,
        belongsTo.alias
      );
      lookup.push(...select)
    }

    // Generate the exclude stages if options.exclude is provided
    if (belongsTo.options?.exclude) {
      const exclude = this.exclude(
        belongsTo.options.exclude,
        belongsTo.alias
      );
      lookup.push(...exclude)
    }

    // Return the combined lookup, select, and exclude stages
    return lookup
  }

  /**
   * @note This method generates the lookup stages for the belongsTo relation.
   * @param {IRelationBelongsTo} belongsTo - The belongsTo relation details.
   * @return {Document[]} The lookup stages.
   */
  static lookup(belongsTo: IRelationBelongsTo): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (belongsTo.model.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${belongsTo.model.getIsDeleted()}`, false] }],
          },
        },
      });
    }

    // Define the $lookup stage
    const $lookup = {
      from: belongsTo.model.$collection,
      localField: belongsTo.foreignKey,
      foreignField: belongsTo.ownerKey,
      as: belongsTo.alias,
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({
      $lookup,
    });

    // Define the $unwind stage
    const _unwind = {
      $unwind: {
        path: `$${belongsTo.alias}`,
        preserveNullAndEmptyArrays: true,
      },
    };

    // Add the $unwind stage to the lookup array
    lookup.push(_unwind);

    return lookup;
  }
}
