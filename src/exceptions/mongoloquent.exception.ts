export class MongoloquentException extends Error {
	public error?: any;

	constructor(message: string, error?: any) {
		super(message);
		this.name = "MongoloquentException";
		this.error = error;
		Object.setPrototypeOf(this, MongoloquentException.prototype);
	}
}
