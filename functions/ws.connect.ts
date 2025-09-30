import { put } from "./lib/db";

export async function handler(event: any) {
	const { connectionId, domainName, stage } = event.requestContext;
	const now = Math.floor(Date.now() / 1000);
	await put({
		PK: `CONN#${connectionId}`,
		SK: "META",
		connectionId,
		domainName,
		stage,
		ttl: now + 60 * 60 * 24,
	});
	return { statusCode: 200 };
}
