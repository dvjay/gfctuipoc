import { INode, IEdge, NodeId, EdgeId, INwData } from "../models/nw-data"; 
import { GraphLog } from "../models/graph-log";
// State for graph 
export const STORE_GRAPH_SLICE_NAME = "nwGraph";
export interface State {
    data: INwData;// Send to render the graph if rootNodeId is not null. 
    autoNetworkExpand: boolean; 
    rootNodeId: string | undefined; 
    selectedNodes: INode[]; 
    excludedNodeTypes: string[]; 
    hideLabel: boolean; 
    skewedNodeLogs: GraphLog[]; 
    logs: GraphLog[]; 
    maxNodesExceeded: boolean;
}

export const initialState: State = {
    data : { nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}, 
    autoNetworkExpand: false, 
    selectedNodes: [], 
    rootNodeId: undefined, 
    excludedNodeTypes: [], 
    hideLabel: true, 
    skewedNodeLogs: [], 
    logs: [], 
    maxNodesExceeded: false
};
