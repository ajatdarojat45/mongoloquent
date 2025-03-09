import { Document } from "mongodb";
import { IRelationHasManyThrough } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";

export default class HasManyThrough extends LookupBuilder {
  /**
   * Generates the lookup, select, and exclude stages for the HasManyThrough relation.
   * @param {IRelationHasManyThrough} hasManyThrough - The HasManyThrough relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(hasManyThrough: IRelationHasManyThrough): Document[] {
    // Generate the lookup stages for the HasManyThrough relationship
    const lookup = this.lookup(hasManyThrough);

    // Generate the select stages if options.select is provided
    if (hasManyThrough.options?.select) {
      const select = this.select(
        hasManyThrough.options.select,
        hasManyThrough.alias
      );
      lookup.push(...select)
    }

    // Generate the exclude stages if options.exclude is provided
    if (hasManyThrough.options?.exclude) {
      const exclude = this.exclude(
        hasManyThrough.options.exclude,
        hasManyThrough.alias
      );
      lookup.push(...exclude)
    }

    if (hasManyThrough.options?.sort) {
      const sort = this.sort(
        hasManyThrough.options?.sort[0],
        hasManyThrough.options?.sort[1]
      )
      lookup.push(sort)
    }

    if (hasManyThrough.options?.skip) {
      const skip = this.skip(hasManyThrough.options?.skip)
      lookup.push(skip)
    }

    if (hasManyThrough.options?.limit) {
      const limit = this.limit(hasManyThrough.options?.limit)
      lookup.push(limit)
    }

    // Return the combined lookup, select, and exclude stages
    return lookup
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
