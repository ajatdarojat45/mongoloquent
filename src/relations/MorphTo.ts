import { Document } from "mongodb";
import Relation from "../Relation";
import Model from "../Model";
import { IRelationOptions } from "../interfaces/IRelation";

export default class MorphTo {
  /**
   * @note This method generates the lookup, select, and exclude stages for the MorphTo relation.
   * @param {typeof Model} target - The target model.
   * @param {string} name - The name of the morph.
   * @param {string} type - The type of the morph.
   * @param {string} id - The ID of the morph.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @param {string} alias - The alias for the relation.
   * @param {IRelationOptions} options - The options for the relation.
   * @return {Document[]} The lookup stages.
   */
  static generate(
    target: typeof Model,
    name: string,
    type: string,
    id: string,
    ownerKey: string = "_id",
    alias: string,
    options: IRelationOptions
  ): Document[] {
    // Generate the lookup stages for the MorphTo relationship
    if (alias === "") alias = "alias";
    const lookup = this.lookup(target, name, type, id, ownerKey, alias);
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
   * @note This method generates the lookup stages for the MorphTo relation.
   * @param {typeof Model} target - The target model.
   * @param {string} name - The name of the morph.
   * @param {string} type - The type of the morph.
   * @param {string} id - The ID of the morph.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @param {string} alias - The alias for the relation.
   * @return {Document[]} The lookup stages.
   */
  static lookup(
    target: typeof Model,
    name: string,
    type: string,
    id: string,
    ownerKey: string = "_id",
    alias: string
  ): Document[] {
    const lookup: Document[] = [{ $project: { alias: 0 } }];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (target.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${target.getIsDeleted()}`, false] },
              {
                $eq: [`$${type}`, name],
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
                $eq: [`$${type}`, name],
              },
            ],
          },
        },
      });
    }

    // Define the $lookup stage
    const $lookup = {
      from: target.$collection,
      localField: ownerKey,
      foreignField: `${id}`,
      as: alias,
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({ $lookup });

    // Define the $unwind stage
    lookup.push({
      $unwind: {
        path: `$${alias}`,
        preserveNullAndEmptyArrays: true,
      },
    });

    return lookup;
  }
}
