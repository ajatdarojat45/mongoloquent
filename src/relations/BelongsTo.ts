import Relation from "../Relation";
import Model from "../Model";
import { IRelationOptions } from "../interfaces/IRelation";
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
	public static generate(
		related: typeof Model,
		foreignKey: string,
		ownerKey: string = "_id",
		alias: string,
		options: IRelationOptions
	): Document[] {
		// Generate the lookup stages for the belongsTo relationship
		const lookup = this.lookup(related, foreignKey, ownerKey, alias);
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
	 * @note This method generates the lookup stages for the belongsTo relation.
	 * @param {typeof Model} related - The related model.
	 * @param {string} foreignKey - The foreign key.
	 * @param {string} [ownerKey="_id"] - The owner key.
	 * @param {string} alias - The alias for the relation.
	 * @return {Document[]} The lookup stages.
	 */
	static lookup(
		related: typeof Model,
		foreignKey: string,
		ownerKey: string = "_id",
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
			localField: foreignKey,
			foreignField: ownerKey,
			as: alias,
			pipeline: pipeline,
		};

		// Add the $lookup stage to the lookup array
		lookup.push({
			$lookup,
		});

		// Define the $unwind stage
		const _unwind = {
			$unwind: {
				path: `$${alias}`,
				preserveNullAndEmptyArrays: true,
			},
		};

		// Add the $unwind stage to the lookup array
		lookup.push(_unwind);

		return lookup;
	}
}
