# Pointing Poker

A real-time collaborative estimation tool for agile software development teams built with modern serverless technologies.

## Features

- **Real-time Collaboration**: WebSocket-based voting with instant updates
- **Multiple User Roles**: Members can vote, observers can watch
- **Anonymous Voting**: Votes remain hidden until revealed by facilitator
- **Round Management**: Multiple estimation rounds with custom titles
- **Vote History**: Complete history of past rounds and results
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Backend
- **SST v3** - Serverless framework for AWS
- **AWS Lambda** - Serverless functions
- **API Gateway** - WebSocket and HTTP APIs
- **DynamoDB** - NoSQL database with TTL
- **TypeScript** - Type safety across the stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TanStack Router** - Type-safe routing
- **Tailwind CSS + DaisyUI** - Styling and components
- **TypeScript** - Type safety

## Getting Started

### Prerequisites
- Node.js 18+
- AWS CLI configured with appropriate permissions
- SST CLI installed globally: `npm install -g sst`

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jwhaley5/pointing-poker.git
cd pointing-poker
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install && cd ..
cd shared && npm install && cd ..
```

3. Start the development environment:
```bash
npm run dev
```

This will:
- Deploy the AWS infrastructure (DynamoDB, Lambda, API Gateway)
- Start the frontend development server
- Enable live reloading for both frontend and backend changes

### Deployment

Deploy to production:
```bash
npm run deploy
```

Remove development resources:
```bash
npm run remove-dev
```

## How to Use

1. **Create a Room**: Click "Create a room" to generate a new estimation session
2. **Join a Room**: Enter a room ID to join an existing session
3. **Choose Your Role**: 
   - **Member**: Can participate in voting
   - **Observer**: Can watch but not vote
4. **Vote**: Select your estimation from the available cards (0, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, ☕)
5. **Reveal**: Once all members have voted, reveal the results
6. **Start New Round**: Begin a new estimation round with a custom title

## Available Scripts

### Root Project
- `npm run dev` - Start development environment
- `npm run deploy` - Deploy to production
- `npm run typecheck` - Run TypeScript type checking

### Frontend
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
├── functions/           # Lambda function handlers
│   ├── lib/            # Shared utilities (DB, WebSocket, validation)
│   ├── http.createRoom.ts
│   ├── ws.*.ts         # WebSocket route handlers
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Shared UI components
│   │   ├── features/   # Feature-specific components
│   │   ├── routes/     # TanStack Router routes
│   │   └── utils/      # Utilities and context
├── shared/             # Shared TypeScript types
│   └── src/
├── sst.config.ts       # SST infrastructure configuration
└── package.json
```

## API Reference

### HTTP Endpoints
- `POST /rooms` - Create a new poker room

### WebSocket Routes
- `join` - Join a room as member or observer
- `vote` - Submit or update vote for current round
- `reveal` - Reveal all votes in current round
- `startRound` - Start a new estimation round
- `setRoomTitle` - Update room title
- `setRoundTitle` - Update current round title
- `sync` - Synchronize current room state

## Data Model

The application uses DynamoDB with a single table design:

- **PK**: `ROOM#{roomId}` - Partition key for room data
- **SK**: Various patterns for different entity types:
  - `ROOM` - Room metadata
  - `ROUND#{roundNumber}` - Round information
  - `MEMBER#{memberId}` - Member data
  - `OBSERVER#{observerId}` - Observer data
  - `VOTE#{roundNumber}#{memberId}` - Individual votes
  - `CONN#{connectionId}` - WebSocket connections

## Environment Variables

### Backend
- `WS_MANAGEMENT_ENDPOINT` - API Gateway WebSocket management endpoint

### Frontend
- `VITE_WS_URL` - WebSocket connection URL
- `VITE_API_URL` - HTTP API base URL

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests if applicable
4. Run type checking: `npm run typecheck`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the ISC License.
