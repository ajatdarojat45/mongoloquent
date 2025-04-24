import { Document } from "mongodb";

/**
 * LookupBuilder class
 *
 * Utility class that builds various MongoDB aggregation pipeline stages for relationships.
 * Provides methods to generate stages for selecting fields, excluding fields, sorting,
 * limiting, and skipping documents in aggregation pipelines.
 */
export default class LookupBuilder {
  /**
   * Constructs the stages required to select specific columns in a relation.
   *
   * @note This method constructs the stages required to select specific columns in a "has one" relation.
   * @param {string|string[]} columns - The columns to select. Can be a single column name or an array of column names.
   * @param {string} alias - The alias for the relation.
   * @return {Document[]} The lookup stages to be used in an aggregation pipeline.
   */
  static select(columns: string | string[], alias: string): Document[] {
    const lookup: Document[] = [];
    const _columns: string[] = [];
    const pipeline: any = [];
    let project = {
      $project: {
        document: "$$ROOT",
      },
    };

    // Convert columns to an array if it's a string
    if (typeof columns === "string") _columns.push(columns);
    else _columns.push(...columns);

    // Add the columns to the project stage
    _columns.forEach((el) => {
      project = {
        ...project,
        $project: {
          ...project.$project,
          [`${alias}.${el}`]: 1,
        },
      };
    });

    // Add pipeline stages if selecting columns
    pipeline.push(
      {
        $set: {
          [`document.${alias}`]: `$${alias}`,
        },
      },
      {
        $replaceRoot: {
          newRoot: "$document",
        },
      },
    );

    // Add the project and additional stages to the lookup array
    lookup.push(project, ...pipeline);

    return lookup;
  }

  /**
   * Constructs the stages required to exclude specific columns in a relation.
   *
   * @note This method constructs the stages required to exclude specific columns in a "has one" relation.
   * @param {string|string[]} columns - The columns to exclude. Can be a single column name or an array of column names.
   * @param {string} alias - The alias for the relation.
   * @return {Document[]} The lookup stages to be used in an aggregation pipeline.
   */
  static exclude(columns: string | string[], alias: string): Document[] {
    const lookup: Document[] = [];
    const _columns: string[] = [];
    // Convert columns to an array if it's a string
    if (typeof columns === "string") _columns.push(columns);
    else _columns.push(...columns);

    let project = {
      $project: {},
    };

    _columns.forEach((field: any) => {
      project = {
        ...project,
        $project: {
          ...project.$project,
          [`${alias}.${field}`]: 0,
        },
      };
    });

    lookup.push(project);

    return lookup;
  }

  /**
   * Constructs the stage required for sorting documents in an aggregation pipeline.
   *
   * @note This method constructs the stage required to sort documents by a specified column.
   * @param {string} column - The column to sort by.
   * @param {"asc" | "desc"} sort - The sort order, either "asc" for ascending or "desc" for descending.
   * @return {Document} The sort stage to be used in an aggregation pipeline.
   */
  static sort(column: string, sort: "asc" | "desc"): Document {
    const _sort = sort === "asc" ? 1 : -1;
    const $sort = {
      [column]: _sort,
    };

    return { $sort };
  }

  /**
   * Constructs the stage required to skip documents in an aggregation pipeline.
   *
   * @note This method constructs the stage required to skip a specified number of documents.
   * @param {number} skip - The number of documents to skip.
   * @return {Document} The skip stage to be used in an aggregation pipeline.
   */
  static skip(skip: number): Document {
    return { $skip: skip };
  }

  /**
   * Constructs the stage required to limit documents in an aggregation pipeline.
   *
   * @note This method constructs the stage required to limit the number of documents.
   * @param {number} limit - The maximum number of documents to return.
   * @return {Document} The limit stage to be used in an aggregation pipeline.
   */
  static limit(limit: number): Document {
    return { $limit: limit };
  }
}
