/** Public API of the architecture module (the deck imports only from here). */
export { ArchitectureDiagram, GROUP_COLOR, LEVEL_COLOR, type ArchitectureDiagramProps } from "./components/ArchitectureDiagram";
export { ARCH_NODES, ARCH_EDGES, ARCH_LEVELS, ARCH_GROUP_LABEL, ARCH_TEXT, MAP, type ArchNode, type ArchEdge, type ArchLevel, type ArchGroup } from "./data/architecture";
export { routeEdges, connections, activeEdges, isNodeActive, defaultNodeFor } from "./utils/layout";
