// lib/data/navigationPaths.ts
// Navigation graph for Terminal 3 pathfinding - FIXED CONNECTIONS

export interface NavigationNode {
  id: string;
  coordinates: { x: number; y: number; level: string };
  type: 'intersection' | 'security' | 'customs' | 'entrance' | 'elevator';
  name?: string;
  connections: Array<{
    to: string;
    distance: number;
    accessible?: boolean;
    levelChange?: string;
  }>;
}

// Simplified, fully-connected navigation graph
const navigationGraph: NavigationNode[] = [
  // Main entrance/security area
  {
    id: 'n_entrance',
    coordinates: { x: 600, y: 125, level: 'departure' },
    type: 'entrance',
    name: 'Terminal 3 Main Entrance',
    connections: [
      { to: 'n_security', distance: 50, accessible: true },
      { to: 'n_central_hub', distance: 150, accessible: true }
    ]
  },
  
  {
    id: 'n_security',
    coordinates: { x: 600, y: 175, level: 'departure' },
    type: 'security',
    name: 'Security Checkpoint',
    connections: [
      { to: 'n_entrance', distance: 50, accessible: true },
      { to: 'n_central_hub', distance: 100, accessible: true }
    ]
  },
  
  {
    id: 'n_central_hub',
    coordinates: { x: 700, y: 225, level: 'departure' },
    type: 'intersection',
    name: 'Central Hub',
    connections: [
      { to: 'n_security', distance: 100, accessible: true },
      { to: 'n_concourse_a_start', distance: 150, accessible: true },
      { to: 'n_concourse_b_start', distance: 120, accessible: true },
      { to: 'n_concourse_c_start', distance: 200, accessible: true }
    ]
  },
  
  // Concourse A pathway
  {
    id: 'n_concourse_a_start',
    coordinates: { x: 850, y: 175, level: 'departure' },
    type: 'intersection',
    name: 'Concourse A Start',
    connections: [
      { to: 'n_central_hub', distance: 150, accessible: true },
      { to: 'n_concourse_a_mid', distance: 150, accessible: true }
    ]
  },
  
  {
    id: 'n_concourse_a_mid',
    coordinates: { x: 1000, y: 175, level: 'departure' },
    type: 'intersection',
    name: 'Concourse A Middle',
    connections: [
      { to: 'n_concourse_a_start', distance: 150, accessible: true },
      { to: 'n_concourse_a_end', distance: 100, accessible: true }
    ]
  },
  
  {
    id: 'n_concourse_a_end',
    coordinates: { x: 1100, y: 175, level: 'departure' },
    type: 'intersection',
    name: 'Concourse A End',
    connections: [
      { to: 'n_concourse_a_mid', distance: 100, accessible: true }
    ]
  },
  
  // Concourse B pathway
  {
    id: 'n_concourse_b_start',
    coordinates: { x: 500, y: 300, level: 'departure' },
    type: 'intersection',
    name: 'Concourse B Start',
    connections: [
      { to: 'n_central_hub', distance: 120, accessible: true },
      { to: 'n_concourse_b_mid', distance: 100, accessible: true }
    ]
  },
  
  {
    id: 'n_concourse_b_mid',
    coordinates: { x: 600, y: 325, level: 'departure' },
    type: 'intersection',
    name: 'Concourse B Middle',
    connections: [
      { to: 'n_concourse_b_start', distance: 100, accessible: true },
      { to: 'n_concourse_b_end', distance: 100, accessible: true }
    ]
  },
  
  {
    id: 'n_concourse_b_end',
    coordinates: { x: 700, y: 350, level: 'departure' },
    type: 'intersection',
    name: 'Concourse B End',
    connections: [
      { to: 'n_concourse_b_mid', distance: 100, accessible: true }
    ]
  },
  
  // Concourse C pathway
  {
    id: 'n_concourse_c_start',
    coordinates: { x: 150, y: 450, level: 'departure' },
    type: 'intersection',
    name: 'Concourse C Start',
    connections: [
      { to: 'n_central_hub', distance: 200, accessible: true },
      { to: 'n_concourse_c_mid', distance: 100, accessible: true }
    ]
  },
  
  {
    id: 'n_concourse_c_mid',
    coordinates: { x: 250, y: 475, level: 'departure' },
    type: 'intersection',
    name: 'Concourse C Middle',
    connections: [
      { to: 'n_concourse_c_start', distance: 100, accessible: true },
      { to: 'n_concourse_c_end', distance: 70, accessible: true }
    ]
  },
  
  {
    id: 'n_concourse_c_end',
    coordinates: { x: 300, y: 525, level: 'departure' },
    type: 'intersection',
    name: 'Concourse C End',
    connections: [
      { to: 'n_concourse_c_mid', distance: 70, accessible: true }
    ]
  },
  
  // Arrival level
  {
    id: 'n_arrival_baggage',
    coordinates: { x: 600, y: 125, level: 'arrival' },
    type: 'intersection',
    name: 'Baggage Claim Area',
    connections: [
      { to: 'n_arrival_customs', distance: 50, accessible: true }
    ]
  },
  
  {
    id: 'n_arrival_customs',
    coordinates: { x: 600, y: 100, level: 'arrival' },
    type: 'customs',
    name: 'Customs & Exit',
    connections: [
      { to: 'n_arrival_baggage', distance: 50, accessible: true },
      { to: 'n_arrival_transport', distance: 50, accessible: true }
    ]
  },
  
  {
    id: 'n_arrival_transport',
    coordinates: { x: 650, y: 100, level: 'arrival' },
    type: 'intersection',
    name: 'Ground Transportation',
    connections: [
      { to: 'n_arrival_customs', distance: 50, accessible: true }
    ]
  },
  
  // Vertical connection
  {
    id: 'n_elevator_main',
    coordinates: { x: 650, y: 150, level: 'both' },
    type: 'elevator',
    name: 'Main Elevator',
    connections: [
      { to: 'n_security', distance: 75, accessible: true },
      { to: 'n_arrival_customs', distance: 75, accessible: true, levelChange: 'down' }
    ]
  }
];

export type { NavigationNode };
export default navigationGraph;