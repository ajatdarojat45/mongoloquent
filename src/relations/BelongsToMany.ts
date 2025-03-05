import { Document } from "mongodb";
import Relation from "../Relation";
import { IRelationBelongsToMany } from "../interfaces/IRelation";

export default class BelongsToMany {
  /**
   * Generates the lookup, select, and exclude stages for the BelongsToMany relation.
   * @param {IRelationBelongsToMany} belongsToMany - The BelongsToMany relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(belongsToMany: IRelationBelongsToMany): Document[] {
    // Generate the lookup stages for the BelongsToMany relationship
    const lookup = this.lookup(belongsToMany);
    let select: any = [];
    let exclude: any = [];

    // Generate the select stages if options.select is provided
    if (belongsToMany.options?.select)
      select = Relation.selectRelationColumns(
        belongsToMany.options.select,
        belongsToMany.alias
      );

    // Generate the exclude stages if options.exclude is provided
    if (belongsToMany.options?.exclude)
      exclude = Relation.excludeRelationColumns(
        belongsToMany.options.exclude,
        belongsToMany.alias
      );

    // Return the combined lookup, select, and exclude stages
    return [...lookup, ...select, ...exclude];
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
    if (belongsToMany.model.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${belongsToMany.model.getIsDeleted()}`, false] }],
          },
        },
      });
    }

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: belongsToMany.pivotModel.$collection,
          localField: belongsToMany.parentKey,
          foreignField: belongsToMany.foreignPivotKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: belongsToMany.model.$collection,
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
