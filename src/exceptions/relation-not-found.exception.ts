import { MongoloquentException } from "./index";

export class MongoloquentRelationNotFoundException extends MongoloquentException {
	public error?: any;

	constructor(message: string, error?: any) {
		super(message, error);
		this.name = "MongoloquentRelationNotFoundException";
		Object.setPrototypeOf(
			this,
			MongoloquentRelationNotFoundException.prototype,
		);
	}
}
