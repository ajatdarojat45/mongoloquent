import { MongoloquentException } from "./index";

export class MongoloquentMultipleItemsFoundException extends MongoloquentException {
	public error?: any;

	constructor(message: string, error?: any) {
		super(message, error);
		this.name = "MongoloquentMultipleItemsFoundException";
		Object.setPrototypeOf(
			this,
			MongoloquentMultipleItemsFoundException.prototype,
		);
	}
}
