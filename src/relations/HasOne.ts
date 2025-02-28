import { Document } from "mongodb";
import Model from "../Model";
import Relation from "../Relation";
import { IRelationOptions } from "../interfaces/IRelation";

export default class HasOne {
	/**
	 * @note This method generates the lookup, select, and exclude stages for the hasOne relation.
	 * @param {typeof Model} related - The related model.
	 * @param {string} foreignKey - The foreign key.
	 * @param {string} [localKey="_id"] - The local key.
	 * @param {string} alias - The alias for the relation.
	 * @param {IRelationOptions} options - The options for the relation.
	 * @return {Document[]} The lookup stages.
	 */
	static generate(
		related: typeof Model,
		foreignKey: string,
		localKey: string = "_id",
		alias: string,
		options: IRelationOptions
	): Document[] {
		// Generate the lookup stages for the hasOne relationship
		const lookup = this.lookup(related, foreignKey, localKey, alias);
		let select: Document[] = [];
		let exclude: Document[] = [];

		// Generate the select stages if options.select is provided
		if (options.select)
			select = Relation.selectRelationColumns(options.select, alias);

		// Generate the exclude stages if options.exclude is provided
		if (options.exclude)
			exclude = Relation.excludeRelationColumns(options.exclude, alias);

		// Return the combined lookup, select, and exclude stages
		return [...lookup, ...select, ...exclude];
	}

	/**
	 * @note This method generates the lookup stages for the hasOne relation.
	 * @param {typeof Model} related - The related model.
	 * @param {string} foreignKey - The foreign key.
	 * @param {string} [localKey="_id"] - The local key.
	 * @param {string} alias - The alias for the relation.
	 * @return {Document[]} The lookup stages.
	 */
	static lookup(
		related: typeof Model,
		foreignKey: string,
		localKey: string = "_id",
		alias: string
	): Document[] {
		const collection = related.$collection;
		const lookup: Document[] = [];
		const pipeline: Document[] = [];
		const useSoftDelete = related.$useSoftDelete;

		// Add soft delete condition to the pipeline if enabled
		if (useSoftDelete) {
			pipeline.push({
				$match: {
					$expr: {
						$and: [{ $eq: ["$isDeleted", false] }],
					},
				},
			});
		}

		// Define the $lookup stage
		const $lookup = {
			from: collection,
			localField: localKey,
			foreignField: foreignKey,
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
