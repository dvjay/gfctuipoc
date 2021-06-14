import { ActionTypes, AddDNDBNotification, AddSkewedNotification, CollapseNode, ExcludeNodeTypes, ExpandNode, LoadExternalData, SelectNode, SelectOnlyClickedNode } from './actions'; 
import { initialState, State } from './state'; 
import { GraphLogType, generateUniqueId, GraphLog } from '../models/graph-log';
import { Action } from '@ngrx/store';

export function graphReducer(state = initialState, action: Action): State {
    switch(action.type) { 
        case ActionTypes.TOGGLE_LABEL: { 
            return {
                ...state,
                hideLabel: !state.hideLabel 
            };
        }
        case ActionTypes.RESET_GRAPH: { 
            return {
                ...initialState
            };
        }
        case ActionTypes.EXCLUDE_NODE_TYPES: { 
            const payload = (action as ExcludeNodeTypes).payload;
            return {
                ...state, 
                excludedNodeTypes: [...payload]
            };
        }
        case ActionTypes.COLLAPSE_NODE : {
            const payload = (action as CollapseNode).payload;
            const colNodeId = payload.nodeId; 
            const currStateNodes = state.data.nodes; 
            const nodeToCollapse = currStateNodes.get(colNodeId); 
            const currentVisibleNodes = payload.currentVisibleNodes; 
            const currentVisibleEdges = payload.currentVisibleEdges; 
            let edgeswhithColSource = currentVisibleEdges.filter((x: any) => x.sourceNodeId === colNodeId); 
            edgeswhithColSource = Array.isArray(edgeswhithColSource) ? edgeswhithColSource : []; 
            const targetNodeIds = edgeswhithColSource.map((x: any) => x.targetNodeId);
            
            if(nodeToCollapse && currStateNodes.has(colNodeId)) {
                nodeToCollapse.collapsed = true;
            } else {
                return state;
            }
            return {
                ...state,
                data: {nodes: currStateNodes, edges: state.data.edges }
            };
        }
        case ActionTypes.EXPAND_NODE: {
            const payload = (action as ExpandNode).payload;
            const colNodeId = payload.nodeId; 
            const currStateNodes = state.data.nodes; 
            const nodeToCollapse = currStateNodes.get(colNodeId); 
            const currentVisibleNodes = payload.currentVisibleNodes; 
            const currentVisibleEdges = payload.currentVisibleEdges; 
            let edgeswhithColSource = currentVisibleEdges.filter((x: any) => x.sourceNodeId === colNodeId); 
            edgeswhithColSource = Array.isArray(edgeswhithColSource) ? edgeswhithColSource : []; 
            const targetNodeIds = edgeswhithColSource.map((x: any) => x.targetNodeId);
            
            if(nodeToCollapse && currStateNodes.has(colNodeId)) {
                nodeToCollapse.collapsed = false;
            } else {
                return state;
            }
            return {
                ...state, 
                data: { nodes: currStateNodes, edges: state.data.edges }
            };
        }
        case ActionTypes.LOAD_EXTERNAL_DATA: {
            const payload = (action as LoadExternalData).payload; 
            const rootNodeId = payload.rootNodeId; 
            let nwData = payload.data; 
            const maxNodesCount = payload.maxNodeCount; 
            let isMaxNodesCountExceeded = state.maxNodesExceeded;
            const rootNode = nwData.nodes.get(rootNodeId); 
            
            if(nwData && nwData.nodes && rootNode) {
                rootNode.collapsed = false; 
                if(Array.isArray(rootNode.sourceIds)) { 
                    rootNode.sourceIds.forEach((nId: any) => {
                        const n = nwData.nodes.get(nId); 
                        if(n) {
                            n.collapsed = false;
                        }
                    });
                }
                if(Array.isArray(rootNode.targetIds)) { 
                    rootNode.targetIds.forEach((nId: any) => {
                        const n = nwData.nodes.get(nId); 
                        if(n) {
                            n.collapsed = false;
                        }
                    });
                }
            } else {
                nwData = initialState.data;
            }
            
            if(payload.data && payload.data.nodes && payload.data.nodes.size > maxNodesCount) {
                isMaxNodesCountExceeded = true; 
            } else {
                isMaxNodesCountExceeded = false;
            }

            return {
                ...initialState, 
                rootNodeId: payload.rootNodeId, 
                data: nwData, 
                maxNodesExceeded: isMaxNodesCountExceeded
            };
        }
        case ActionTypes.RESET_NODES_POSITIONS: {
            const currentNodes = state.data.nodes; 
            const currentEdges = state.data.edges;
            
            for(let [key, value] of currentNodes) {
                delete value.x; 
                delete value.y; 
                delete value.vx; 
                delete value.vy; 
                delete value.fx; 
                delete value.fy;
            }
            return {
                ...state, 
                data: { nodes: currentNodes, edges: currentEdges }
            };
        }
        case ActionTypes.TOGGLE_AUTO_EXPAND: {
            const currentVal = state.autoNetworkExpand;

            return currentVal? 
                {...state, autoNetworkExpand: !currentVal } :  
                {...state, autoNetworkExpand: !currentVal, data: { nodes: state.data.nodes, edges: state.data.edges } };
        }
        case ActionTypes.ADD_SKEWED_NOTIFICATION: {
            const node = (action as AddSkewedNotification).payload;
            const currentSkewedNodeLogs = state.skewedNodeLogs; 
            const currentLogs = state.logs; 

            const skewedLog = { id: generateUniqueId(), nodeIds: [node.nodeId], logType: GraphLogType.Warning, 
                                message: "Unusual Volumn!", source: "graphReducer",
                                messageDesc: "Network search returned a node with a large volumn of connections.",
                                timestamp: new Date() } as GraphLog;
            return {
                ...state, 
                skewedNodeLogs: [skewedLog, ...currentSkewedNodeLogs], 
                logs: [skewedLog, ...currentLogs]
            };
        }
        case ActionTypes. ADD_DNDB_NOTIFICATION: {
            const node = (action as AddDNDBNotification).payload;
            const currentSkewedNodeLogs = state.skewedNodeLogs; 
            const currentLogs = state.logs;

            const skewedLog = { id: generateUniqueId(), nodeIds: [node.nodeId], 
                                logType: GraphLogType.Warning, message: "Do Not Do Business (DNDB)!", 
                                source: "graphReducer", messageDesc: "Network search returned a DNDB connection.", 
                                timestamp: new Date() } as GraphLog;
            return {
                ...state, 
                skewedNodeLogs: [skewedLog, ...currentSkewedNodeLogs], 
                logs: [skewedLog, ...currentLogs]
            };
        }
        case ActionTypes.ADD_FRDAML_CASE_NOTIFICATION: {
            return state;
        }
        case ActionTypes.SELECT_NODE: {
            const nodeId = (action as SelectNode).payload;
            const node = state.data.nodes.get(nodeId); 
            if (node) {
                const nIdx = state.selectedNodes.findIndex((x: any) => x.nodeId === node.nodeId); 
                if(nIdx > -1) { 
                    return {
                        ...state, 
                        selectedNodes: state.selectedNodes.slice(0, nIdx).concat(state.selectedNodes.slice(nIdx + 1, state.selectedNodes.length))
                    };
                } else { 
                    return {
                        ...state, 
                        selectedNodes: [node, ...state.selectedNodes]
                    };
                }
            } else {
                return state;
            }
        }
        case ActionTypes.SELECT_ONLY_CLICKED_NODE: {
            const nodeId = (action as SelectOnlyClickedNode).payload;
            const node = state.data.nodes.get(nodeId); 
            if(node) { 
                return {
                    ... state, 
                    selectedNodes: [node]
                };
            } else {
                return state;
            }
        }
        case ActionTypes.UNSELECT_ALL_NODES: { 
            return {
                ...state, 
                selectedNodes: []
            };
        }
        default: {
            return state;
        }
    }
}