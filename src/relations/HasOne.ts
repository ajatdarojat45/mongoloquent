import { Document } from "mongodb";
import Relation from "../Relation";
import { IRelationHasOne } from "../interfaces/IRelation";

export default class HasOne {
  /**
   * Generates the lookup, select, and exclude stages for the hasOne relation.
   * @param {IRelationHasOne} hasOne - The hasOne relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(hasOne: IRelationHasOne): Document[] {
    // Generate the lookup stages for the hasOne relationship
    const lookup = this.lookup(hasOne);
    let select: any = [];
    let exclude: any = [];

    // Generate the select stages if options.select is provided
    if (hasOne.options?.select)
      select = Relation.selectRelationColumns(
        hasOne.options.select,
        hasOne.alias
      );

    // Generate the exclude stages if options.exclude is provided
    if (hasOne.options?.exclude)
      exclude = Relation.excludeRelationColumns(
        hasOne.options.exclude,
        hasOne.alias
      );

    // Return the combined lookup, select, and exclude stages
    return [...lookup, ...select, ...exclude];
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

    // Define the $unwind stage
    lookup.push({
      $unwind: {
        path: `$${hasOne.alias}`,
        preserveNullAndEmptyArrays: true,
      },
    });

    return lookup;
  }
}
