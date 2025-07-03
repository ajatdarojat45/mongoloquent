import { TransactionOptions } from "mongodb";

export interface IDBLookup {
  from: string;
  localField: string;
  foreignField: string;
  as: string;
}

export interface ITransactionConfig {
  transactionOptions?: TransactionOptions;
  retries?: number;
};
