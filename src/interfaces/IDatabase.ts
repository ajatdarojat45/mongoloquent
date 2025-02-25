import { Db } from "mongodb";

export interface IDb {
  name: string,
  db: Db
}
