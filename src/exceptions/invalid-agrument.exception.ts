import { MongoloquentException } from "./index";

export class MongoloquentInvalidArgumentException extends MongoloquentException {
	public error?: any;

	constructor(message: string, error?: any) {
		super(message, error);
		this.name = "MongoloquentInvalidArgumentException";
		Object.setPrototypeOf(this, MongoloquentInvalidArgumentException.prototype);
	}
}
