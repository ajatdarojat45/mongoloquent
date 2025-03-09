import { Document } from "mongodb"

export default class LookupBuilder {
  /**
   * @note This method selects columns in a has one relation.
   * @param {string|string[]} columns - The columns to select.
   * @param {string} alias - The alias for the relation.
   * @return {Document[]} The lookup stages.
   */
  static select(
    columns: string | string[],
    alias: string
  ): Document[] {
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
      }
    );

    // Add the project and additional stages to the lookup array
    lookup.push(project, ...pipeline);

    return lookup;
  }

  /**
   * @note This method excludes columns in a has one relation.
   * @param {string|string[]} columns - The columns to exclude.
   * @param {string} alias - The alias for the relation.
   * @return {Document[]} The lookup stages.
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

  static sort(column: string, sort: "asc" | "desc"): Document {
    const _sort = sort === "asc" ? 1 : -1
    const $sort = {
      [column]: _sort
    }

    return { $sort }
  }

  static skip(skip: number): Document {
    return { $skip: skip }
  }

  static limit(limit: number): Document {
    return { $limit: limit }
  }
}
