export type Result<T> =
	| { readonly ok: true; readonly value: T }
	| { readonly ok: false; readonly message: string };
