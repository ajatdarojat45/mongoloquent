import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
  IMongoloquentTimestamps,
} from "../interfaces/ISchema";

// FormSchema schema will give us the type of the schema without the mongoloquent fields
export type FormSchema<T> = Omit<
  T,
  | keyof IMongoloquentSchema
  | keyof IMongoloquentSoftDelete
  | keyof IMongoloquentTimestamps
>;
