import { Document } from "mongodb";
import Relation from "../Relation";
import Model from "../Model";
import { IRelationOptions } from "../interfaces/IRelation";

export default class BelongsToMany {
  /**
   * @note This method generates the lookup, select, and exclude stages for the BelongsToMany relation.
   * @param {typeof Model} related - The related model.
   * @param {typeof Model} table - The pivot table model.
   * @param {string} foreignPivotKey - The foreign pivot key.
   * @param {string} relatedPivotKey - The related pivot key.
   * @param {string} [parentKey="_id"] - The parent key.
   * @param {string} [relatedKey="_id"] - The related key.
   * @param {string} alias - The alias for the relation.
   * @param {IRelationOptions} options - The options for the relation.
   * @return {Document[]} The lookup stages.
   */
  static generate(
    related: typeof Model,
    table: typeof Model,
    foreignPivotKey: string,
    relatedPivotKey: string,
    parentKey: string = "_id",
    relatedKey: string = "_id",
    alias: string,
    options: IRelationOptions
  ): Document[] {
    // Generate the lookup stages for the BelongsToMany relationship
    const lookup = this.lookup(
      related,
      table,
      foreignPivotKey,
      relatedPivotKey,
      parentKey,
      relatedKey,
      alias
    );
    let select: any = [];
    let exclude: any = [];

    // Generate the select stages if options.select is provided
    if (options?.select)
      select = Relation.selectRelationColumns(options.select, alias);

    // Generate the exclude stages if options.exclude is provided
    if (options?.exclude)
      exclude = Relation.excludeRelationColumns(options.exclude, alias);

    // Return the combined lookup, select, and exclude stages
    return [...lookup, ...select, ...exclude];
  }

  /**
   * @note This method generates the lookup stages for the BelongsToMany relation.
   * @param {typeof Model} related - The related model.
   * @param {typeof Model} table - The pivot table model.
   * @param {string} foreignPivotKey - The foreign pivot key.
   * @param {string} relatedPivotKey - The related pivot key.
   * @param {string} [parentKey="_id"] - The parent key.
   * @param {string} [relatedKey="_id"] - The related key.
   * @param {string} alias - The alias for the relation.
   * @return {Document[]} The lookup stages.
   */
  static lookup(
    related: typeof Model,
    table: typeof Model,
    foreignPivotKey: string,
    relatedPivotKey: string,
    parentKey: string = "_id",
    relatedKey: string = "_id",
    alias: string
  ): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (related.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${related.getIsDeleted()}`, false] }],
          },
        },
      });
    }

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: table.$collection,
          localField: parentKey,
          foreignField: foreignPivotKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: related.$collection,
          localField: `pivot.${relatedPivotKey}`,
          foreignField: relatedKey,
          as: alias || "pivot",
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
