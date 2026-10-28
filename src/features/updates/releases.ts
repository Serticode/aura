interface ReleaseNote {
	readonly title: string;
	readonly description: string;
	readonly tone: "rose" | "lilac" | "mint" | "sky" | "sun";
	readonly icon:
		"bookmark" | "heart" | "sound" | "canvas" | "moon" | "settings" | "sparkle";
}

interface Release {
	readonly id: string;
	readonly date: string;
	readonly notes: readonly ReleaseNote[];
}

// Newest first. Give each published update a new, stable id so it appears unread.
export const releases = [
	{
		id: "2026-10-27-footer-updates",
		date: "27 October 2026",
		notes: [
			{
				title: "A little place for what’s new",
				description:
					"Find the latest changes right here. A small dot in the footer lets you know when there’s something new.",
				tone: "sun",
				icon: "sparkle",
			},
			{
				title: "Words worth keeping",
				description:
					"Save gentle words with the bookmark. Come back to them in Mirror, whenever you need.",
				tone: "lilac",
				icon: "bookmark",
			},
			{
				title: "A softer kind of feedback",
				description:
					"Turn on interaction sounds in Settings for soft taps, selections and completed responses. Quiet release stays silent.",
				tone: "mint",
				icon: "sound",
			},
		],
	},
	{
		id: "2026-10-23-mirror",
		date: "23 October 2026",
		notes: [
			{
				title: "Room to breathe",
				description:
					"Move and zoom the dotted background. Your words and controls stay comfortably in place.",
				tone: "sky",
				icon: "canvas",
			},
			{
				title: "Light or dark",
				description:
					"Choose the light that feels right. Tap the sun or moon in the toolbar; Aura remembers on this device.",
				tone: "lilac",
				icon: "moon",
			},
			{
				title: "Settings, close at hand",
				description:
					"Adjust your space in a floating panel, without leaving what you’re writing.",
				tone: "sun",
				icon: "settings",
			},
			{
				title: "Release in your own way",
				description:
					"Choose Gentle words for a response, or Just let me release for a quiet moment without one.",
				tone: "rose",
				icon: "heart",
			},
		],
	},
] as const satisfies readonly Release[];

export const latestReleaseId = releases[0].id;

export const updateIcons = {
	bookmark: "M7 4h10v17l-5-3-5 3Z",
	heart:
		"M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1Z",
	sound: "M11 5 6 9H3v6h3l5 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
	canvas: "M4 12h16m-4-4 4 4-4 4M8 8l-4 4 4 4",
	moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z",
	settings: "M4 7h16M4 17h16M8 4v6m8 4v6",
	sparkle: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z",
} as const;
