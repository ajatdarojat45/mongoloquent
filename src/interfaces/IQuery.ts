export interface IWhere {
  column: string
  operator: string
  value: any
  boolean: string
}


export interface IOrder {
  column: string
  order: string | number
  isSensitive: boolean
}
