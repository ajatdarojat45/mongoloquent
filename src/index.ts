import "dotenv/config";
import { Collection } from "./core";

export * from "./types";
export * from "./exceptions";
export * from "./core";
export * from "./relationships";

export function collect<T>(values: T[]) {
	return new Collection<T>(...values);
}
