import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force'; 

// import { SimulationLinkDatum, SimulationNodeDatum } from "d3";

export enum NeighboursStateType {
    NOT_LOADED, 
    LOADING, 
    LOADING_THEN_EXPAND, 
    LOADING_FAILED, 
    LOADED
}

export enum IsSkewed {
    YES = "Y", 
    NO = "N"
}

export interface INode extends SimulationNodeDatum {
    id?: string; 
    type?: string; 
    label?: string; 
    r?: number; 
    neighboursStatus?: NeighboursStateType; 
    sourceIds?: Array<NodeId>; 
    targetIds?: Array<NodeId>; 
    [key: string]: any;
    nodeId: string; 
    nodeType: string; 
    title: string; 
    nodeRawObject: any; 
    collapsed: boolean; 
    color: string; 
    imagePath: string; 
    nodeDescAttribute: INodeDescAttribute;
}

export type NodeId = INode['id']; 
export interface INodeDescAttribute {
    attribute: string; 
    title: string;
}
export interface INodeAttribute{
    key: string; 
    displayName: string; 
    rawPath: string; 
    tooltip: boolean;
}

export type NodeAttributeId = INodeAttribute['key'];

export interface INodeType {
    name: string; 
    displayName: string; 
    color: string; 
    imagePath: string; 
    nodeAttributes: INodeAttribute[]; 
    // alerts:
}

export interface IEdge extends SimulationLinkDatum<SimulationNodeDatum> {
    index?: number; 
    id: string; 
    source: string; 
    target: string; 
    // sourceNodeId: string; 
    // targetNodeId: string; 
    title?: string; 
    [key: string]: any;
    // Hack 
    sourceNodeId: string; 
    targetNodeId: string; 
    linkId: string; 
    name: string;
}

export type EdgeId = IEdge['id'];

export interface INwData {
    nodes: Map<NodeId, INode>; 
    edges: Map<EdgeId, IEdge>;
}