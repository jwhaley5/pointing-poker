/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "pointing-poker",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
		};
	},
	async run() {
		/**
		 * DynamoDB Table for storing poker game data.
		 */
		const table = new sst.aws.Dynamo("johnWhaley-poker-pokerTable", {
			fields: {
				PK: "string",
				SK: "string",
			},
			primaryIndex: { hashKey: "PK", rangeKey: "SK" },
			ttl: "ttl"
		});

		const ws = new sst.aws.ApiGatewayWebSocket("johnwhaley-poker-wsApi")

		const wsCommon: sst.aws.FunctionArgs = {
			handler: "functions/ws.default",
			link: [table],
			environment: {
				WS_MANAGEMENT_ENDPOINT: ws.managementEndpoint
			},
		} as const

		ws.route("$connect", { ...wsCommon, handler: "functions/ws.connect" });
		ws.route("$disconnect", { ...wsCommon, handler: "functions/ws.disconnect" });
		ws.route("$default", wsCommon);

		ws.route("join", { ...wsCommon, handler: "functions/ws.join" });
		ws.route("vote", { ...wsCommon, handler: "functions/ws.vote" });
		ws.route("reveal", { ...wsCommon, handler: "functions/ws.reveal" });
		ws.route("startRound", { ...wsCommon, handler: "functions/ws.startRound" });
		ws.route("sync", { ...wsCommon, handler: "functions/ws.sync" });

		const api = new sst.aws.ApiGatewayV2("johnwhaley-poker-httpApi");

		api.route("POST /rooms", {
			handler: "functions/http.createRoom.handler",
			link: [table],
			environment: {
				WS_URL: ws.url,
			}
		})

		const site = new sst.aws.StaticSite("johnwhaley-poker-frontend", {
			path: "frontend",
			build: { command: "npm run build", output: "dist" },
			environment: {
				VITE_WS_URL: ws.url,
				VITE_API_URL: api.url
			}
		})

		return {
			TableName: table.name,
			WebSocketUrl: ws.url,
			WebSocketMgmtEndpoint: ws.managementEndpoint,
			ApiUrl: api.url,
			SiteUrl: site.url
		}
	}
});
