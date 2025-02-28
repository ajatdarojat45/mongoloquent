import { Document } from "mongodb";
import Relation from "../Relation";
import Model from "../Model";
import { IRelationOptions } from "../interfaces/IRelation";

export default class HasManyThrough {
  /**
   * @note This method generates the lookup, select, and exclude stages for the HasManyThrough relation.
   * @param {typeof Model} related - The related model.
   * @param {typeof Model} through - The through model.
   * @param {string} firstKey - The first key.
   * @param {string} secondKey - The second key.
   * @param {string} [localKey="_id"] - The local key.
   * @param {string} [secondLocalKey="_id"] - The second local key.
   * @param {string} alias - The alias for the relation.
   * @param {IRelationOptions} options - The options for the relation.
   * @return {Document[]} The lookup stages.
   */
  static generate(
    related: typeof Model,
    through: typeof Model,
    firstKey: string,
    secondKey: string,
    localKey: string = "_id",
    secondLocalKey: string = "_id",
    alias: string,
    options: IRelationOptions
  ): Document[] {
    // Generate the lookup stages for the HasManyThrough relationship
    const lookup = this.lookup(
      related,
      through,
      firstKey,
      secondKey,
      localKey,
      secondLocalKey,
      alias
    );
    let select: Document[] = [];
    let exclude: Document[] = [];

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
   * @note This method generates the lookup stages for the HasManyThrough relation.
   * @param {typeof Model} related - The related model.
   * @param {typeof Model} through - The through model.
   * @param {string} firstKey - The first key.
   * @param {string} secondKey - The second key.
   * @param {string} [localKey="_id"] - The local key.
   * @param {string} [secondLocalKey="_id"] - The second local key.
   * @param {string} alias - The alias for the relation.
   * @return {Document[]} The lookup stages.
   */
  static lookup(
    related: typeof Model,
    through: typeof Model,
    firstKey: string,
    secondKey: string,
    localKey: string = "_id",
    secondLocalKey: string = "_id",
    alias: string
  ): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (related.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: ["$isDeleted", false] }],
          },
        },
      });
    }

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: through.$collection,
          localField: localKey,
          foreignField: firstKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: related.$collection,
          localField: `pivot.${secondLocalKey}`,
          foreignField: `${secondKey}`,
          as: alias || "alias",
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
