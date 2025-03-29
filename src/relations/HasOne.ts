import { Document } from "mongodb";
import { IRelationHasOne } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";

export default class HasOne extends LookupBuilder {
  static generate(hasOne: IRelationHasOne): Document[] {
    const lookup = this.lookup(hasOne);

    if (hasOne.options?.select) {
      const select = this.select(hasOne.options.select, hasOne.alias);
      lookup.push(...select);
    }

    if (hasOne.options?.exclude) {
      const exclude = this.exclude(hasOne.options.exclude, hasOne.alias);
      lookup.push(...exclude);
    }

    return lookup;
  }

  static lookup(hasOne: IRelationHasOne): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (hasOne.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${hasOne.model["$isDeleted"]}`, false] }],
          },
        },
      });
    }

    const $lookup = {
      from: hasOne.relatedModel["$collection"],
      localField: hasOne.localKey,
      foreignField: hasOne.foreignKey,
      as: hasOne.alias,
      pipeline: pipeline,
    };

    lookup.push({ $lookup });

    lookup.push({
      $unwind: {
        path: `$${hasOne.alias}`,
        preserveNullAndEmptyArrays: true,
      },
    });

    return lookup;
  }
}
