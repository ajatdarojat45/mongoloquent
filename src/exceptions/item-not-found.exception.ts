import { MongoloquentException } from "./index";

export class MongoloquentItemNotFoundException extends MongoloquentException {
	public error?: any;

	constructor(message: string, error?: any) {
		super(message, error);
		this.name = "MongoloquentItemNotFoundException";
		Object.setPrototypeOf(this, MongoloquentItemNotFoundException.prototype);
	}
}
