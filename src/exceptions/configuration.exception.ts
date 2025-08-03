import { MongoloquentException } from "./index";

export class MongoloquentConfigurationException extends MongoloquentException {
	public error?: any;

	constructor(message: string, error?: any) {
		super(message, error);
		this.name = "MongoloquentConfigurationException";
		Object.setPrototypeOf(this, MongoloquentConfigurationException.prototype);
	}
}
