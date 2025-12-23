// lib/services/simplePathfinding.ts
// Simplified pathfinding using direct distance calculation

import terminal3POIs from '../data/terminalMaps';
import allTerminal3POIs from '../data/terminalMaps_facilities';

interface POI {
  id: string;
  name: string;
  coordinates: { x: number; y: number; level: string };
  [key: string]: any;
}

interface Route {
  distance: number;
  walkingTime: number;
  instructions: string[];
  waypoints: POI[];
}

function calculateDistance(a: POI, b: POI): number {
  const dx = b.coordinates.x - a.coordinates.x;
  const dy = b.coordinates.y - a.coordinates.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getDirection(from: POI, to: POI): string {
  const dx = to.coordinates.x - from.coordinates.x;
  const dy = to.coordinates.y - from.coordinates.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  if (angle >= -22.5 && angle < 22.5) return 'east';
  if (angle >= 22.5 && angle < 67.5) return 'northeast';
  if (angle >= 67.5 && angle < 112.5) return 'north';
  if (angle >= 112.5 && angle < 157.5) return 'northwest';
  if (angle >= 157.5 || angle < -157.5) return 'west';
  if (angle >= -157.5 && angle < -112.5) return 'southwest';
  if (angle >= -112.5 && angle < -67.5) return 'south';
  return 'southeast';
}

export function findSimplePath(start: POI, end: POI): Route {
  const distance = calculateDistance(start, end);
  const walkingTime = Math.ceil(distance / 1.4); // 1.4 m/s walking speed
  const direction = getDirection(start, end);
  
  const instructions = [
    `Start at ${start.name}`,
    `Head ${direction} towards ${end.name} (approximately ${Math.round(distance)}m)`,
    `Arrive at ${end.name}`
  ];

  return {
    distance: Math.round(distance),
    walkingTime,
    instructions,
    waypoints: [start, end]
  };
}

export function findPOI(query: string): POI | undefined {
  const allPOIs = [...terminal3POIs, ...allTerminal3POIs];
  const normalized = query.toLowerCase().trim();
  
  return allPOIs.find(poi => 
    poi.id.toLowerCase() === normalized ||
    poi.name.toLowerCase() === normalized ||
    poi.keywords?.some((k: string) => k.toLowerCase() === normalized)
  );
}

export default { findSimplePath, findPOI };