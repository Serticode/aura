import type { Words } from "@/domain/words";

export interface Reflection extends Words {
	readonly source: "reflection" | "quiet";
}

type RestingState =
	| { readonly stage: "writing" }
	| { readonly stage: "response"; readonly response: Reflection };

export type MirrorState =
	| RestingState
	| { readonly stage: "thinking"; readonly controller: AbortController }
	| { readonly stage: "releasing"; readonly response: Reflection }
	| { readonly stage: "saved"; readonly returnTo: RestingState };
