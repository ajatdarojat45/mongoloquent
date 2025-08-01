import { MongoloquentException } from "./index";

export class MongoloquentNotFoundException extends MongoloquentException {
	public error?: any;

	constructor(message: string, error?: any) {
		super(message, error);
		this.name = "MongoloquentNotFoundException";
		Object.setPrototypeOf(this, MongoloquentNotFoundException.prototype);
	}
}
