import { Document } from "mongodb";
import { IRelationHasOne } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";

export default class HasOne extends LookupBuilder {
  /**
   * Generates the lookup, select, and exclude stages for the hasOne relation.
   * @param {IRelationHasOne} hasOne - The hasOne relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(hasOne: IRelationHasOne): Document[] {
    // Generate the lookup stages for the hasOne relationship
    const lookup = this.lookup(hasOne);

    // Generate the select stages if options.select is provided
    if (hasOne.options?.select) {
      const select = this.select(hasOne.options.select, hasOne.alias);
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (hasOne.options?.exclude) {
      const exclude = this.exclude(hasOne.options.exclude, hasOne.alias);
      lookup.push(...exclude);
    }

    // Return the combined lookup, select, and exclude stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the hasOne relation.
   * @param {IRelationHasOne} hasOne - The hasOne relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(hasOne: IRelationHasOne): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (hasOne.model.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${hasOne.model.getIsDeleted()}`, false] }],
          },
        },
      });
    }

    // Define the $lookup stage
    const $lookup = {
      from: hasOne.model.$collection,
      localField: hasOne.localKey,
      foreignField: hasOne.foreignKey,
      as: hasOne.alias,
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({ $lookup });

    // Define the $unwind stage to deconstruct the array field
    lookup.push({
      $unwind: {
        path: `$${hasOne.alias}`,
        preserveNullAndEmptyArrays: true,
      },
    });

    return lookup;
  }
}
