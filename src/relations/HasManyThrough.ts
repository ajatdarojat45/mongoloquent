import { Document } from "mongodb";
import Relation from "../Relation";
import { IRelationHasManyThrough } from "../interfaces/IRelation";

export default class HasManyThrough {
  /**
   * Generates the lookup, select, and exclude stages for the HasManyThrough relation.
   * @param {IRelationHasManyThrough} hasManyThrough - The HasManyThrough relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(hasManyThrough: IRelationHasManyThrough): Document[] {
    // Generate the lookup stages for the HasManyThrough relationship
    const lookup = this.lookup(hasManyThrough);
    let select: any = [];
    let exclude: any = [];

    // Generate the select stages if options.select is provided
    if (hasManyThrough.options?.select)
      select = Relation.selectRelationColumns(
        hasManyThrough.options.select,
        hasManyThrough.alias
      );

    // Generate the exclude stages if options.exclude is provided
    if (hasManyThrough.options?.exclude)
      exclude = Relation.excludeRelationColumns(
        hasManyThrough.options.exclude,
        hasManyThrough.alias
      );

    // Return the combined lookup, select, and exclude stages
    return [...lookup, ...select, ...exclude];
  }

  /**
   * Generates the lookup stages for the HasManyThrough relation.
   * @param {IRelationHasManyThrough} hasManyThrough - The HasManyThrough relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(hasManyThrough: IRelationHasManyThrough): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (hasManyThrough.model.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${hasManyThrough.model.getIsDeleted()}`, false] }],
          },
        },
      });
    }

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: hasManyThrough.throughModel.$collection,
          localField: hasManyThrough.localKey,
          foreignField: hasManyThrough.foreignKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: hasManyThrough.model.$collection,
          localField: `pivot.${hasManyThrough.localKeyThrough}`,
          foreignField: `${hasManyThrough.foreignKeyThrough}`,
          as: hasManyThrough.alias || "alias",
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
