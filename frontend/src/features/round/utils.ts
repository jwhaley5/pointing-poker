
// src/utils/voteUtils.ts
import type { Snapshot } from './types';
import { CARD_NUMBERS } from './CARD_NUMBERS';

/**
 * Calculate the numeric average of votes.
 * Omits non-numeric values like "?" and "☕".
 */
export const calculateAverage = (snap: Snapshot): number => {
	const activeMembers = snap.members
		.filter((m) => m.present)
		.map((m) => m.memberId);

	const votes = Object.entries(snap.currentRoundVotes).filter(([memberId]) =>
		activeMembers.includes(memberId),
	);
	if (votes.length === 0) return 0;

	const votesNumbers = votes
		.map(([, v]) => v)
		.filter((v): v is string => v != null)
		.filter((v) => v !== '?' && v !== '☕')
		.map((v) => Number(v))
		.filter((n) => Number.isFinite(n));

	if (votesNumbers.length === 0) return 0;

	const avg = votesNumbers.reduce((a, b) => a + b, 0) / votesNumbers.length;
	return avg;
};

/**
 * Find the closest numeric card to the given number.
 * Excludes "?" and "☕".
 */
export const closestCard = (num: number): string | null => {
	const numericCards = CARD_NUMBERS
		.filter((c) => c !== '?' && c !== '☕')
		.map(Number);

	if (!Number.isFinite(num) || numericCards.length === 0) return null;

	let closest = numericCards[0];
	for (const c of numericCards) {
		const diff = Math.abs(c - num);
		const best = Math.abs(closest - num);
		if (diff < best || (diff === best && c < closest)) {
			closest = c;
		}
	}
	return String(closest);
};

/**
 * Extract numeric vote values from a votes record (e.g. round.votes).
 * Omits "?" and "☕" and any non-numeric entries.
 */
export const extractNumericVotes = (votes: Record<string, string | null>): number[] => {
	return Object.values(votes)
		.filter((v): v is string => v != null)
		.filter((v) => v !== '?' && v !== '☕')
		.map((v) => Number(v))
		.filter((n) => Number.isFinite(n));
};

/**
 * Calculate the average from a votes record (e.g. round.votes).
 * Returns null if there are no numeric votes.
 */
export const calculateAverageFromVotes = (
	votes: Record<string, string | null>
): number | null => {
	const nums = extractNumericVotes(votes);
	if (nums.length === 0) return null;
	const sum = nums.reduce((a, b) => a + b, 0);
	return sum / nums.length;
};
