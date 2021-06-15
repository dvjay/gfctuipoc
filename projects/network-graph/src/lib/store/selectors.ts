import { createFeatureSelector, createSelector } from '@ngrx/store'; 
import { INode, IEdge } from '../models/nw-data'; 
import { State as GraphState, STORE_GRAPH_SLICE_NAME} from './state';

export const getNetworkGraphState = createFeatureSelector<GraphState>(STORE_GRAPH_SLICE_NAME);

export const selectGraphData = createSelector(
    getNetworkGraphState, 
    state => state.data
);
export const selectIsHideLabel = createSelector(
    getNetworkGraphState, 
    state => state.hideLabel
);
export const selectAutoNetworkExpand = createSelector(
    getNetworkGraphState, state => state. autoNetworkExpand
);
export const selectExcludedNodeTypes = createSelector(
    getNetworkGraphState, 
    state => state.excludedNodeTypes
);
export const selectRootNodeId = createSelector(
    getNetworkGraphState, 
    state => state.rootNodeId
);
export const selectLogs = createSelector(
    getNetworkGraphState, 
    state => state.logs
);
export const selectSkewedNodeLogs = createSelector(
    getNetworkGraphState, 
    state => state. skewedNodeLogs
);
export const selectMaxNodesExceeded = createSelector(
    getNetworkGraphState, 
    state => state.maxNodesExceeded
);
export const selectSelectedNodes = createSelector(
    getNetworkGraphState, 
    state => state.selectedNodes
);

export const selectDirectLinked = createSelector(
    selectRootNodeId, selectGraphData, 
    (rootNodeId, graphData) => {
        const nodes = graphData.nodes; 
        const edges = graphData.edges; 
        const filteredNodes = new Map<string, INode>(); 
        const filteredLinks = new Map<string, IEdge>();
        
        if(rootNodeId) {
            const rootNode = nodes.get(rootNodeId); 
            if(rootNode && rootNode.collapsed) {
                filteredNodes.set(rootNodeId, rootNode);
            } else {
                const queue = [rootNodeId]; 
                let current: string; 
                let currentNode: INode; 
                let neighborIds: string[];
                
                while (queue. length != 0) {
                    current = queue.shift()!; 
                    if(current && nodes.has(current)) {
                        currentNode = nodes.get(current)!; 
                        filteredNodes.set(current, currentNode); 
                        neighborIds = [...(currentNode.sourceIds as string[]), ...(currentNode. targetIds as string[])];
                        for (var j = 0; j < neighborIds.length; j++) {
                            const neighNode = nodes.get(neighborIds[j]); 
                            if (neighNode && neighNode.collapsed) {
                                filteredNodes.set(neighborIds[j], nodes.get(neighborIds[j])!);
                            } else { 
                                if (!filteredNodes.has(neighborIds[j])) {
                                    queue.push(neighborIds[j]);
                                }
                            }
                        }
                    }
                }
            }
            for(let [key, value] of edges) { 
                if(filteredNodes.has(value.sourceNodeId) && filteredNodes.has(value.targetNodeId)) {
                    filteredLinks.set(key, value);
                }
            }
        }    
        /**Node Type Filter */ 
        return { nodes: filteredNodes, edges: filteredLinks};
    }
);

export const selectDirectLinkedFilterByNodeType = createSelector(
    selectDirectLinked, 
    selectExcludedNodeTypes, 
    (directLinked, excludeNodeTypes) => {
        const nodes = directLinked.nodes; 
        const edges = directLinked.edges; 
        const filteredNodes = new Map<string, INode>(); 
        const filteredLinks = new Map<string, IEdge>();

        for(let [key, value] of nodes) { 
            if (!excludeNodeTypes.includes(value.nodeType)) {
                filteredNodes.set(key, value);
            }
        }
        for(let [key, value] of edges) {
            if(filteredNodes.has(value.sourceNodeId) && filteredNodes.has(value.targetNodeId)) {
                filteredLinks.set(key, value);
            }
        }
        /**Node Type Filter */ 
        return { nodes: filteredNodes, edges: filteredLinks};
    }
);
    