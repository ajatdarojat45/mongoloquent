import { MongoloquentException } from "./index";

export class MongoloquentInvalidOperatorException extends MongoloquentException {
	public error?: any;

	constructor(message: string, error?: any) {
		super(message, error);
		this.name = "MongoloquentInvalidOperatorException";
		Object.setPrototypeOf(this, MongoloquentInvalidOperatorException.prototype);
	}
}
