// lib/services/navigationEngine.ts
// Complete offline navigation engine with A* pathfinding for Abu Dhabi Airport

import terminalPOIs from '../data/terminalMaps';
import allTerminal3POIs from '../data/terminalMaps_facilities';
import navigationGraph, { NavigationNode } from '../data/navigationPaths';

export interface POI {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  terminal: string;
  coordinates: {
    x: number;
    y: number;
    level: string;
  };
  description?: string;
  operatingHours?: string;
  accessibility?: boolean;
  keywords: string[];
  connectedTo?: string[];
}

export interface NavigationRoute {
  distance: number;
  walkingTime: number;
  instructions: string[];
  waypoints: POI[];
}

class NavigationEngine {
  private allPOIs: POI[] = [];
  private poiIndex: Map<string, POI> = new Map();

  constructor() {
    this.initializePOIs();
  }

  private initializePOIs(): void {
    this.allPOIs = [...terminalPOIs, ...allTerminal3POIs];
    this.allPOIs.forEach(poi => {
      this.poiIndex.set(poi.id.toLowerCase(), poi);
      this.poiIndex.set(poi.name.toLowerCase(), poi);
      poi.keywords.forEach(keyword => {
        this.poiIndex.set(keyword.toLowerCase(), poi);
      });
    });
  }

  findPOI(query: string): POI | undefined {
    return this.poiIndex.get(query.toLowerCase().trim());
  }

  searchPOIs(query: string, options?: {
    type?: string;
    category?: string;
    subcategory?: string;
    terminal?: string;
    level?: string;
    accessibility?: boolean;
    limit?: number;
  }): POI[] {
    let results = this.allPOIs;
    
    // Support both 'type' and 'category' for backward compatibility
    const categoryFilter = options?.category || options?.type;
    
    if (categoryFilter) {
      results = results.filter(p => p.category === categoryFilter);
    }
    if (options?.subcategory) {
      results = results.filter(p => p.subcategory === options.subcategory);
    }
    if (options?.terminal) {
      results = results.filter(p => p.terminal === options.terminal);
    }
    if (options?.level) {
      results = results.filter(p => p.coordinates.level === options.level);
    }
    if (options?.accessibility !== undefined) {
      results = results.filter(p => p.accessibility === options.accessibility);
    }
    
    if (query.trim()) {
      const terms = query.toLowerCase().split(' ');
      results = results.filter(p => {
        const searchText = `${p.name} ${p.description || ''} ${p.keywords.join(' ')}`.toLowerCase();
        return terms.some(t => searchText.includes(t));
      });
    }
    
    if (options?.limit) {
      results = results.slice(0, options.limit);
    }
    
    return results;
  }

  getNearbyPOIs(origin: POI, radius: number): Array<POI & { distance: number }> {
    return this.allPOIs
      .filter(p => p.id !== origin.id && p.coordinates.level === origin.coordinates.level)
      .map(p => ({
        ...p,
        distance: this.calculateDistance(origin.coordinates, p.coordinates)
      }))
      .filter(p => p.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  private calculateDistance(
    a: { x: number; y: number },
    b: { x: number; y: number }
  ): number {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  }

  findPath(start: POI, end: POI): NavigationRoute | null {
    const startNode = this.findClosestNode(start.coordinates);
    const endNode = this.findClosestNode(end.coordinates);
    
    if (!startNode || !endNode) {
      return null;
    }

    const openSet = new Set<string>([startNode.id]);
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>([[startNode.id, 0]]);
    const fScore = new Map<string, number>([
      [startNode.id, this.calculateDistance(startNode.coordinates, endNode.coordinates)]
    ]);

    while (openSet.size > 0) {
      let current: NavigationNode | undefined;
      let lowestF = Infinity;
      
      for (const id of openSet) {
        const f = fScore.get(id) || Infinity;
        if (f < lowestF) {
          lowestF = f;
          current = navigationGraph.find(n => n.id === id);
        }
      }

      if (!current) break;

      if (current.id === endNode.id) {
        return this.reconstructPath(cameFrom, current, start, end, gScore.get(current.id) || 0);
      }

      openSet.delete(current.id);

      for (const conn of current.connections) {
        const neighbor = navigationGraph.find(n => n.id === conn.to);
        if (!neighbor) continue;

        const tentativeScore = (gScore.get(current.id) || 0) + conn.distance;

        if (tentativeScore < (gScore.get(conn.to) || Infinity)) {
          cameFrom.set(conn.to, current.id);
          gScore.set(conn.to, tentativeScore);
          fScore.set(conn.to, tentativeScore + this.calculateDistance(neighbor.coordinates, endNode.coordinates));
          openSet.add(conn.to);
        }
      }
    }

    return null;
  }

  private findClosestNode(coords: { x: number; y: number; level: string }): NavigationNode | undefined {
    const sameLevelNodes = navigationGraph.filter(
      n => n.coordinates.level === coords.level || n.coordinates.level === 'both'
    );
    
    if (sameLevelNodes.length === 0) return undefined;

    let closest: NavigationNode | undefined;
    let minDist = Infinity;

    for (const node of sameLevelNodes) {
      const dist = this.calculateDistance(coords, node.coordinates);
      if (dist < minDist) {
        minDist = dist;
        closest = node;
      }
    }

    return closest;
  }

  private reconstructPath(
    cameFrom: Map<string, string>,
    current: NavigationNode,
    start: POI,
    end: POI,
    totalDistance: number
  ): NavigationRoute {
    const path: NavigationNode[] = [current];
    let nodeId = current.id;

    while (cameFrom.has(nodeId)) {
      nodeId = cameFrom.get(nodeId)!;
      const node = navigationGraph.find(n => n.id === nodeId);
      if (node) path.unshift(node);
    }

    const instructions: string[] = [];
    instructions.push(`Start at ${start.name}`);

    for (let i = 0; i < path.length - 1; i++) {
      const curr = path[i];
      const next = path[i + 1];
      const connection = curr.connections.find(c => c.to === next.id);
      
      if (connection) {
        const direction = this.getDirection(curr.coordinates, next.coordinates);
        instructions.push(`Continue ${direction} for ${Math.round(connection.distance)}m`);
        
        if (next.type === 'security' || next.type === 'customs') {
          instructions.push(`Pass through ${next.type}`);
        }
        
        if (connection.levelChange) {
          instructions.push(`Take ${next.type || 'stairs'} to ${connection.levelChange} level`);
        }
      }
    }

    instructions.push(`Arrive at ${end.name}`);

    const walkingTime = Math.ceil(totalDistance / 1.4);

    return {
      distance: Math.round(totalDistance),
      walkingTime,
      instructions,
      waypoints: [start, end]
    };
  }

  private getDirection(from: { x: number; y: number }, to: { x: number; y: number }): string {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
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

  getStats() {
    return {
      totalPOIs: this.allPOIs.length,
      gates: this.allPOIs.filter(p => p.category === 'gate').length,
      dining: this.allPOIs.filter(p => p.category === 'dining').length,
      retail: this.allPOIs.filter(p => p.category === 'retail').length,
      services: this.allPOIs.filter(p => p.category === 'service').length,
      facilities: this.allPOIs.filter(p => p.category === 'facility').length,
      lounges: this.allPOIs.filter(p => p.category === 'lounge').length,
      transportation: this.allPOIs.filter(p => p.category === 'transportation').length,
      navigationNodes: navigationGraph.length
    };
  }
}

const navigationEngine = new NavigationEngine();
export default navigationEngine;