import { MongoloquentException } from "./index";

export class MongoloquentTransactionException extends MongoloquentException {
	public error?: any;

	constructor(message: string, error?: any) {
		super(message, error);
		this.name = "MongoloquentTransactionException";
		Object.setPrototypeOf(this, MongoloquentTransactionException.prototype);
	}
}
