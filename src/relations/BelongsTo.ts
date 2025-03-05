import Relation from "../Relation";
import { IRelationBelongsTo } from "../interfaces/IRelation";
import { Document } from "mongodb";

export default class BelongsTo {
  /**
   * @note This method defines an inverse one-to-one or many relationship.
   * @param {typeof Model} related - The related model.
   * @param {string} foreignKey - The foreign key.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @param {string} alias - The alias for the relation.
   * @param {IRelationOptions} options - The options for the relation.
   * @return {Document[]} The lookup stages.
   */
  public static generate(belongsTo: IRelationBelongsTo): Document[] {
    // Generate the lookup stages for the belongsTo relationship
    const lookup = this.lookup(belongsTo);
    let select: any = [];
    let exclude: any = [];

    // Generate the select stages if options.select is provided
    if (belongsTo.options?.select)
      select = Relation.selectRelationColumns(belongsTo.options.select, belongsTo.alias);

    // Generate the exclude stages if options.exclude is provided
    if (belongsTo.options?.exclude)
      exclude = Relation.excludeRelationColumns(belongsTo.options.exclude, belongsTo.alias);

    // Return the combined lookup, select, and exclude stages
    return [...lookup, ...select, ...exclude];
  }

  /**
   * @note This method generates the lookup stages for the belongsTo relation.
   * @param {typeof Model} related - The related model.
   * @param {string} foreignKey - The foreign key.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @param {string} alias - The alias for the relation.
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
