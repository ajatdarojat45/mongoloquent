import { MongoloquentException } from "./index";

export class MongoloquentQueryException extends MongoloquentException {
	public error?: any;

	constructor(message: string, error?: any) {
		super(message, error);
		this.name = "MongoloquentQueryException";
		Object.setPrototypeOf(this, MongoloquentQueryException.prototype);
	}
}
