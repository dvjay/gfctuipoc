import { EMPTY_STRING } from "../utils";

export const defaultNwConfig: Readonly<NwConfig> = Object.freeze({
    maxSelectedNodes: 2, 
    displayLabel: true, 
    autoExpand: false, 
    numHops: 2, 
    maxNodeCount: 200, 
    viewportHeight: 700, 
    nodeRadius: 20, 
    node: null, 
    edge: null
});

export const defaultNwNodeConfig: Readonly<NwNode> = Object.freeze({
    parentRawPath: [], 
    nodeIdAttribute: null, 
    nodeTypeAttribute: null, 
    nodeTitleAttribute: null, 
    nodeTypes: [] 
});

export const defaultNwEdgeConfig: Readonly<NwEdge> = Object.freeze({
    parentRawPath: [], 
    edgeSourceIdAttribute: null, 
    edgeTargetIdAttribute: null, 
    edgeTitleAttribute: null, 
    edgeAttributes: []
});

export const defaultNwAttribute: Readonly<NwAttribute> = Object.freeze({ 
    key: EMPTY_STRING, 
    displayName: EMPTY_STRING, 
    rawPath: undefined, 
    tooltip: false
});
    
export interface NwConfig {
    maxSelectedNodes: number; 
    displayLabel: boolean;
    autoExpand: boolean; 
    numHops: number; 
    maxNodeCount: number; 
    viewportHeight: number; 
    nodeRadius: number; 
    node: NwNode | null; 
    edge: NwEdge | null;
}

export interface NwNode {
    parentRawPath: string[]; 
    nodeIdAttribute: NwAttribute | null; 
    nodeTypeAttribute: NwAttribute | null; 
    nodeTitleAttribute: NwAttribute | null; 
    nodeTypes: NwNodeType[];
}

export interface NwEdge { 
    parentRawPath: string[]; 
    edgeSourceIdAttribute: NwAttribute | null; 
    edgeTargetIdAttribute: NwAttribute | null; 
    edgeTitleAttribute: NwAttribute | null; 
    edgeAttributes: NwAttribute[];
}

export interface NwNodeType {
    name: string; 
    displayName: string; 
    color: string; 
    imagePath: string; 
    nodeAttributes: NwAttribute[];
}

export interface NwAttribute {
    key?: string; 
    displayName?: string; 
    rawPath: string[] | undefined; 
    tooltip?: boolean;
}