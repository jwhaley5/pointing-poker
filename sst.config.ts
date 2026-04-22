/// <reference path="./.sst/platform/config.d.ts" />

const AWS_REGION = "us-east-1";
const PRODUCTION_DOMAIN = "pointing.athlorium.com";
const PRODUCTION_API_DOMAIN = "api.pointing.athlorium.com";
const PRODUCTION_WS_DOMAIN = "ws.pointing.athlorium.com";

export default $config({
    app(input) {
        const isProduction = input.stage === "production";

        return {
            name: "pointing-poker",
            removal: isProduction ? "retain" : "remove",
            protect: isProduction,
            home: "aws",
            providers: {
                aws: {
                    region: AWS_REGION,
                },
            },
        };
    },
    async run() {
        const isProduction = $app.stage === "production";

        /**
         * DynamoDB Table for storing poker game data.
         */
        const table = new sst.aws.Dynamo("pointing-poker-table", {
            fields: {
                PK: "string",
                SK: "string",
            },
            primaryIndex: { hashKey: "PK", rangeKey: "SK" },
            ttl: "ttl"
        });

        const ws = new sst.aws.ApiGatewayWebSocket("pointing-poker-ws-api", {
            domain: isProduction
                ? {
                    name: PRODUCTION_WS_DOMAIN,
                    dns: sst.aws.dns(),
                }
                : undefined,
        })

        const wsCommon: sst.aws.FunctionArgs = {
            handler: "functions/ws.default.handler",
            link: [table, ws],
            environment: {
                TABLE_NAME: table.name,
                WS_MANAGEMENT_ENDPOINT: ws.managementEndpoint
            },
        };

        ws.route("$connect", { ...wsCommon, handler: "functions/ws.connect.handler" });
        ws.route("$disconnect", { ...wsCommon, handler: "functions/ws.disconnect.handler" });
        ws.route("$default", wsCommon);

        ws.route("join", { ...wsCommon, handler: "functions/ws.join.handler" });
        ws.route("vote", { ...wsCommon, handler: "functions/ws.vote.handler" });
        ws.route("reveal", { ...wsCommon, handler: "functions/ws.reveal.handler" });
        ws.route("startRound", { ...wsCommon, handler: "functions/ws.startRound.handler" });
        ws.route("setRoomTitle", { ...wsCommon, handler: "functions/ws.setRoomTitle.handler" });
        ws.route("setRoundTitle", { ...wsCommon, handler: "functions/ws.setRoundTitle.handler" });
        ws.route("sync", { ...wsCommon, handler: "functions/ws.sync.handler" });

        const api = new sst.aws.ApiGatewayV2("pointing-poker-http-api", {
            domain: isProduction
                ? {
                    name: PRODUCTION_API_DOMAIN,
                    dns: sst.aws.dns(),
                }
                : undefined,
        });

        api.route("POST /rooms", {
            handler: "functions/http.createRoom.handler",
            link: [table],
            environment: {
                TABLE_NAME: table.name,
                WS_URL: ws.url,
            }
        })

        const site = new sst.aws.StaticSite("pointing-poker-frontend", {
            path: "frontend",
            build: { command: "npm run build", output: "dist" },
            domain: isProduction
                ? {
                    name: PRODUCTION_DOMAIN,
                    dns: sst.aws.dns(),
                }
                : undefined,
            environment: {
                VITE_WS_URL: ws.url,
                VITE_API_URL: api.url
            }
        })

        return {
            Stage: $app.stage,
            TableName: table.name,
            WebSocketUrl: ws.url,
            WebSocketMgmtEndpoint: ws.managementEndpoint,
            ApiUrl: api.url,
            SiteUrl: site.url,
            CustomDomain: isProduction ? PRODUCTION_DOMAIN : "not-configured",
            ApiDomain: isProduction ? PRODUCTION_API_DOMAIN : "not-configured",
            WebSocketDomain: isProduction ? PRODUCTION_WS_DOMAIN : "not-configured"
        }
    }
});
