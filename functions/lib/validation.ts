// Simple type validation helpers for WebSocket messages
import type { ClientMessage } from "@pointing-poker/shared-types";

export function validateClientMessage(payload: any): payload is ClientMessage {
  if (!payload || typeof payload !== 'object') return false;
  
  const { action } = payload;
  
  switch (action) {
    case 'sync':
      return typeof payload.roomId === 'string';
    
    case 'join':
      return typeof payload.roomId === 'string' && 
             typeof payload.name === 'string' &&
             (payload.role === undefined || payload.role === 'member' || payload.role === 'observer');
    
    case 'vote':
      return typeof payload.roomId === 'string' && 
             (payload.value === null || typeof payload.value === 'string');
    
    case 'reveal':
      return typeof payload.roomId === 'string';
    
    case 'startRound':
      return typeof payload.roomId === 'string' && 
             (payload.title === undefined || typeof payload.title === 'string');
    
    case 'setRoomTitle':
      return typeof payload.roomId === 'string' && typeof payload.title === 'string';
    
    case 'setRoundTitle':
      return typeof payload.roomId === 'string' && typeof payload.title === 'string';
    
    default:
      return false;
  }
}

export function parseAndValidate(body: string): ClientMessage | null {
  try {
    const payload = JSON.parse(body);
    return validateClientMessage(payload) ? payload : null;
  } catch {
    return null;
  }
}