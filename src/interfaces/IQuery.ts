export interface IQueryWhere {
  column: string
  operator: string
  value: any
  boolean: string
  type: string
}


export interface IQueryOrder {
  column: string
  order: string | number
  isSensitive: boolean
}

export interface IQueryBuilder {
  collection: string
  connection?: string
  databaseName?: string
  useSoftDelete?: boolean
  useTimestamps?: boolean
}
