# Approve Mirror acknowledgments

The private pilot uses four curated drafts. Source review found no diagnosis, recovery promise, follow-up question, or inferred medical cause in this copy. Human editorial approval is still pending; the app continues to label the words as prototype content.

## Review the bank

Each row corresponds to a stable identifier in `src/features/mirror/responses.ts`:

| Identifier | Selection rule | Draft | Approval |
| --- | --- | --- | --- |
| `overwhelmed` | Only Overwhelmed selected | You don’t have to put every feeling into words. There’s room for you here. | Pending |
| `low` | Only Low selected | You’re allowed to move at the pace you have today. | Pending |
| `neutral` | No mood, mixed moods, or only Tired, Anxious, Okay, Hopeful, or Content | Thank you for making space for what you feel. | Pending |
| `quiet` | Quiet response mode, regardless of moods or writing | Released. | Pending |

Quiet mode takes precedence. Selection never analyzes writing. The response bank is deliberately limited to the existing editorial examples; additional support preferences do not select unreviewed interventions.

## Record approval

1. Review each response for warmth, clarity, burden, and unsupported promises.
2. Check each selection rule, including mixed moods and quiet mode.
3. Record the human approver and approval date in the bank, and change its status only after approval.
4. Review participant-facing labels before removing the prototype designation.

No item has a human approver or approval date yet. An automated review cannot supply either.

## Preserve saved words

Saved words store only response identifiers. Preserve existing identifiers when wording changes without changing meaning. If meaning changes, use a new identifier and define how old saved words remain available. Do not reuse an identifier for unrelated copy or remove an existing saved response without a migration decision.
