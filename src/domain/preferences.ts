export const supportIds = [
	"encouragement", "quiet", "shared", "validation", "reflection", "grounding", "perspective",
] as const;

export type SupportId = (typeof supportIds)[number];
export type PreferenceKey = "appearance.dark" | "sounds" | "notificationSounds" | "reducedMotion" | `support.${SupportId}`;
export type Preferences = Readonly<Record<PreferenceKey, boolean | null>>;

export const emptyPreferences: Preferences = {
	"appearance.dark": null,
	sounds: null,
	notificationSounds: null,
	reducedMotion: null,
	"support.encouragement": null,
	"support.quiet": null,
	"support.shared": null,
	"support.validation": null,
	"support.reflection": null,
	"support.grounding": null,
	"support.perspective": null,
};
