// lib/services/navigationEngine.ts
// A* pathfinding and turn-by-turn navigation

import { POI } from '../data/terminalMaps';
import terminal3POIs from '../data/terminalMaps';
import allTerminal3POIs from '../data/terminalMaps_facilities';
import navigationNodes, { NavigationNode, Connection, calculateDistance, estimateWalkingTime } from '../data/navigationPaths';

export interface Route {
  from: POI;
  to: POI;
  path: NavigationNode[];
  distance: number; // meters
  walkingTime: number; // seconds
  instructions: TurnInstruction[];
}

export interface TurnInstruction {
  step: number;
  action: 'start' | 'continue' | 'turn_left' | 'turn_right' | 'arrive' | 'take_elevator' | 'take_escalator';
  description: string;
  location: string;
  distance?: number;
  time?: number;
}

interface PathNode {
  node: NavigationNode;
  gScore: number; // Cost from start
  fScore: number; // gScore + heuristic
  parent: PathNode | null;
}

class NavigationEngine {
  private allPOIs: POI[];
  private nodes: NavigationNode[];

  constructor() {
    this.allPOIs = [...terminal3POIs, ...allTerminal3POIs];
    this.nodes = navigationNodes;
  }

  // Find POI by ID or name
  findPOI(query: string): POI | null {
    query = query.toLowerCase().trim();
    
    // Try exact ID match first
    let poi = this.allPOIs.find(p => p.id === query);
    if (poi) return poi;
    
    // Try exact name match
    poi = this.allPOIs.find(p => p.name.toLowerCase() === query);
    if (poi) return poi;
    
    // Try keyword match
    poi = this.allPOIs.find(p => 
      p.keywords.some(k => k.toLowerCase() === query)
    );
    if (poi) return poi;
    
    // Try partial name match
    poi = this.allPOIs.find(p => 
      p.name.toLowerCase().includes(query)
    );
    if (poi) return poi;
    
    // Try partial keyword match
    poi = this.allPOIs.find(p => 
      p.keywords.some(k => k.toLowerCase().includes(query))
    );
    
    return poi || null;
  }

  // Search POIs by category or keyword
  searchPOIs(query: string, options?: { 
    category?: string; 
    subcategory?: string;
    level?: string;
    accessibility?: boolean;
    limit?: number;
  }): POI[] {
    query = query.toLowerCase().trim();
    let results = this.allPOIs;

    // Filter by query
    if (query) {
      results = results.filter(poi => 
        poi.name.toLowerCase().includes(query) ||
        poi.keywords.some(k => k.toLowerCase().includes(query)) ||
        poi.description?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (options?.category) {
      results = results.filter(p => p.category === options.category);
    }
    if (options?.subcategory) {
      results = results.filter(p => p.subcategory === options.subcategory);
    }
    if (options?.level) {
      results = results.filter(p => 
        p.coordinates.level === options.level || p.coordinates.level === 'both'
      );
    }
    if (options?.accessibility !== undefined) {
      results = results.filter(p => p.accessibility === options.accessibility);
    }

    // Sort by relevance (exact matches first)
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === query ? 1 : 0;
      const bExact = b.name.toLowerCase() === query ? 1 : 0;
      return bExact - aExact;
    });

    return options?.limit ? results.slice(0, options.limit) : results;
  }

  // Find nearest POI of a type from a given location
  findNearest(fromPOI: POI, category: string, options?: {
    subcategory?: string;
    limit?: number;
  }): POI[] {
    let candidates = this.allPOIs.filter(p => 
      p.category === category &&
      p.coordinates.level === fromPOI.coordinates.level &&
      p.id !== fromPOI.id
    );

    if (options?.subcategory) {
      candidates = candidates.filter(p => p.subcategory === options.subcategory);
    }

    // Calculate distances and sort
    const withDistances = candidates.map(poi => ({
      poi,
      distance: calculateDistance(fromPOI.coordinates, poi.coordinates)
    }));

    withDistances.sort((a, b) => a.distance - b.distance);

    const limit = options?.limit || 3;
    return withDistances.slice(0, limit).map(d => d.poi);
  }

  // A* pathfinding algorithm
  findPath(fromPOI: POI, toPOI: POI, options?: {
    accessible?: boolean; // wheelchair accessible routes only
  }): Route | null {
    // Find nearest navigation nodes to start and end POIs
    const startNode = this.findNearestNode(fromPOI);
    const endNode = this.findNearestNode(toPOI);

    if (!startNode || !endNode) {
      console.error('Could not find navigation nodes for POIs');
      return null;
    }

    // A* algorithm
    const openSet: PathNode[] = [{
      node: startNode,
      gScore: 0,
      fScore: this.heuristic(startNode, endNode),
      parent: null
    }];

    const closedSet = new Set<string>();
    const gScores = new Map<string, number>();
    gScores.set(startNode.id, 0);

    while (openSet.length > 0) {
      // Get node with lowest fScore
      openSet.sort((a, b) => a.fScore - b.fScore);
      const current = openSet.shift()!;

      if (current.node.id === endNode.id) {
        // Reconstruct path
        return this.reconstructPath(current, fromPOI, toPOI);
      }

      closedSet.add(current.node.id);

      // Check neighbors
      for (const connection of current.node.connections) {
        if (closedSet.has(connection.nodeId)) continue;

        // Skip if accessibility required but route not accessible
        if (options?.accessible && !connection.accessible) continue;

        const neighbor = this.nodes.find(n => n.id === connection.nodeId);
        if (!neighbor) continue;

        const tentativeGScore = current.gScore + connection.distance;

        if (!gScores.has(neighbor.id) || tentativeGScore < gScores.get(neighbor.id)!) {
          gScores.set(neighbor.id, tentativeGScore);

          const neighborNode: PathNode = {
            node: neighbor,
            gScore: tentativeGScore,
            fScore: tentativeGScore + this.heuristic(neighbor, endNode),
            parent: current
          };

          // Remove old instance if exists
          const existingIndex = openSet.findIndex(n => n.node.id === neighbor.id);
          if (existingIndex !== -1) {
            openSet.splice(existingIndex, 1);
          }

          openSet.push(neighborNode);
        }
      }
    }

    // No path found
    return null;
  }

  // Heuristic function (Euclidean distance)
  private heuristic(from: NavigationNode, to: NavigationNode): number {
    return calculateDistance(from.coordinates, to.coordinates);
  }

  // Find nearest navigation node to a POI
  private findNearestNode(poi: POI): NavigationNode | null {
    const sameLevelNodes = this.nodes.filter(n => 
      n.coordinates.level === poi.coordinates.level || n.coordinates.level === 'both'
    );

    if (sameLevelNodes.length === 0) return null;

    let nearest = sameLevelNodes[0];
    let minDistance = calculateDistance(poi.coordinates, nearest.coordinates);

    for (const node of sameLevelNodes) {
      const distance = calculateDistance(poi.coordinates, node.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = node;
      }
    }

    return nearest;
  }

  // Reconstruct path from A* result
  private reconstructPath(finalNode: PathNode, fromPOI: POI, toPOI: POI): Route {
    const path: NavigationNode[] = [];
    let current: PathNode | null = finalNode;
    let totalDistance = 0;
    let totalTime = 0;

    // Build path from end to start
    while (current) {
      path.unshift(current.node);
      if (current.parent) {
        const connection = current.parent.node.connections.find(
          c => c.nodeId === current!.node.id
        );
        if (connection) {
          totalDistance += connection.distance * 0.8; // Convert pixels to meters
          totalTime += connection.walkingTime;
        }
      }
      current = current.parent;
    }

    // Generate turn-by-turn instructions
    const instructions = this.generateInstructions(path, fromPOI, toPOI);

    return {
      from: fromPOI,
      to: toPOI,
      path,
      distance: Math.round(totalDistance),
      walkingTime: totalTime,
      instructions
    };
  }

  // Generate turn-by-turn instructions
  private generateInstructions(path: NavigationNode[], fromPOI: POI, toPOI: POI): TurnInstruction[] {
    const instructions: TurnInstruction[] = [];
    
    // Start instruction
    instructions.push({
      step: 1,
      action: 'start',
      description: `Start at ${fromPOI.name}`,
      location: fromPOI.name
    });

    // Intermediate steps
    for (let i = 1; i < path.length - 1; i++) {
      const node = path[i];
      const connection = path[i - 1].connections.find(c => c.nodeId === node.id);
      
      if (node.type === 'elevator' || node.type === 'escalator') {
        instructions.push({
          step: instructions.length + 1,
          action: node.type === 'elevator' ? 'take_elevator' : 'take_escalator',
          description: `Take ${node.type} to ${connection?.levelChange || 'next'} level`,
          location: node.name || node.id,
          time: connection?.walkingTime
        });
      } else if (node.name) {
        instructions.push({
          step: instructions.length + 1,
          action: 'continue',
          description: `Continue through ${node.name}`,
          location: node.name,
          distance: connection ? Math.round(connection.distance * 0.8) : undefined,
          time: connection?.walkingTime
        });
      }
    }

    // Arrival instruction
    instructions.push({
      step: instructions.length + 1,
      action: 'arrive',
      description: `Arrive at ${toPOI.name}`,
      location: toPOI.name
    });

    return instructions;
  }

  // Get all POIs of a category
  getPOIsByCategory(category: string): POI[] {
    return this.allPOIs.filter(p => p.category === category);
  }

  // Get statistics
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
      navigationNodes: this.nodes.length
    };
  }