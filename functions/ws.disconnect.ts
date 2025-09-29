import { del } from "./lib/db";

export async function handler(event: any) {
	const { connectionId } = event.requestContext;
	await del({ PK: `CONN#${connectionId}`, SK: "META" });
	return { statusCode: 200 };
}
