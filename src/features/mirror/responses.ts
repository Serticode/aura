import type { Mood } from "@/app/moods";

// Editorial drafts from the experience guidelines; not approved clinical content.
export const responses = [
	{
		id: "overwhelmed",
		context: "Overwhelmed",
		text: "You don’t have to put every feeling into words. There’s room for you here.",
		revised: "2026-10-08",
		status: "draft",
		approvedBy: null,
		approvedOn: null,
	},
	{
		id: "low",
		context: "Low",
		text: "You’re allowed to move at the pace you have today.",
		revised: "2026-10-08",
		status: "draft",
		approvedBy: null,
		approvedOn: null,
	},
	{
		id: "neutral",
		context: "Untagged or mixed feelings",
		text: "Thank you for making space for what you feel.",
		revised: "2026-10-08",
		status: "draft",
		approvedBy: null,
		approvedOn: null,
	},
	{
		id: "quiet",
		context: "Quiet acknowledgment",
		text: "Released.",
		revised: "2026-10-08",
		status: "draft",
		approvedBy: null,
		approvedOn: null,
	},
] as const;

export type ResponseId = (typeof responses)[number]["id"];

export function selectResponse(moods: readonly Mood[], quiet: boolean) {
	if (quiet) return responses[3];
	if (moods.length === 1 && moods[0] === "Overwhelmed") return responses[0];
	if (moods.length === 1 && moods[0] === "Low") return responses[1];
	return responses[2];
}
