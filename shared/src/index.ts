// Re-export all shared types for easy import
export * from './room-data'
export * from './websocket-messages'

// Convenience type aliases that match current usage patterns
export type { Member, RoomBroadcast as Snapshot, RoomBroadcastBase } from './room-data'