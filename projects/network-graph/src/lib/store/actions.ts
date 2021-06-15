import { Action } from '@ngrx/store'; 
import { INode, IEdge, INwData } from '../models/nw-data'; 
export enum ActionTypes {
    LOAD_NODES_BY_ENTITYID = '[NW]LOAD_BY_ENTITYID', 
    LOAD_NODES_BY_ENTITYID_FAIL = '[NW]LOAD_BY_ENTITYID_FAIL', 
    LOAD_NODES_BY_ENTITYID_SUCCESS = '[NW]LOAD_BY_ENTITYID_SUCCESS',
    ADD_NODES_AND_EDGES = '[NW]ADD_NODES_AND_EDGES',
    EXCLUDE_NODE_TYPES = '[NW]EXCLUDE_NODE_TYPES', 
    EXPAND_NODE = '[NW]EXPAND_NODE', 
    SELECT_NODE = '[NW]SELECT_NODE', 
    SELECT_ONLY_CLICKED_NODE = '[NW]SELECT_ONLY_CLICKED_NODE', 
    UNSELECT_ALL_NODES = '[NW]UNSELECT_ALL_NODES', 
    SET_ENTITY_ID = '[NW]SET_ENTITY_ID', 
    TOGGLE_LABEL = '[NW]TOGGLE_LABEL', 
    TURN_OFF_DISPLAY_SPINNER = '[NW]TURN_OFF_DISPLAY_SPINNER', 
    COLLAPSE_NODE = '[NW]COLLAPSE_NODE', 
    RESET_GRAPH = '[NW]RESET_GRAPH', 
    RESET_NODES_POSITIONS = '[NW]RESET_NODES_POSITIONS', 
    TOGGLE_AUTO_EXPAND = '[NW]TOGGLE_AUTO_EXPAND', 
    ADD_SKEWED_NOTIFICATION = '[NW]ADD_SKEWED_NOTIFICATION', 
    ADD_DNDB_NOTIFICATION = '[NN]ADD_DNDB_NOTIFICATION', 
    ADD_FRDAML_CASE_NOTIFICATION = '[NW]ADD_FRDAML_CASE_NOTIFICATION', 
    LOAD_EXTERNAL_DATA = '[NW]LOAD_EXTERNAL_DATA',
}

export class LoadNodesByEntityId implements Action {
    public readonly type = ActionTypes.LOAD_NODES_BY_ENTITYID; 
    constructor(public payload: string) {}
}
export class LoadNodesByEntityIdFail implements Action {
    public readonly type = ActionTypes.LOAD_NODES_BY_ENTITYID_FAIL; 
    constructor(public payload: Error) {}
}
export class ExcludeNodeTypes implements Action {
    public readonly type = ActionTypes.EXCLUDE_NODE_TYPES; 
    constructor(public payload: string[]) {}
}
export class ExpandNode implements Action {
    public readonly type = ActionTypes.EXPAND_NODE; 
    constructor(public payload: { nodeId: string; currentVisibleNodes: INode[]; currentVisibleEdges: IEdge[];}) {
    }
}
export class SelectNode implements Action {
    public readonly type = ActionTypes.SELECT_NODE; 
    constructor(public payload: string) {}
}
export class SelectOnlyClickedNode implements Action {
    public readonly type = ActionTypes.SELECT_ONLY_CLICKED_NODE; 
    constructor(public payload: string) {}
}
export class UnselectAllNodes implements Action {
    public readonly type = ActionTypes.UNSELECT_ALL_NODES; 
    constructor() {}
}
export class CollapseNode implements Action {
    public readonly type = ActionTypes.COLLAPSE_NODE; 
    constructor(public payload: { nodeId: string; currentVisibleNodes: INode[]; currentVisibleEdges: IEdge[];}) {}
}
export class SetEntityId implements Action {
    public readonly type = ActionTypes.SET_ENTITY_ID; 
    constructor(public payload: string) {}
}
export class ResetGraph implements Action {
    public readonly type = ActionTypes.RESET_GRAPH; 
    constructor() {}
}
export class ToggleLabel implements Action {
    public readonly type = ActionTypes.TOGGLE_LABEL;
}
export class TurnOffDisplaySpinner implements Action {
    public readonly type = ActionTypes.TURN_OFF_DISPLAY_SPINNER; 
    constructor(public payload: string) {}
}
export class ResetNodesPositions implements Action {
    public readonly type = ActionTypes.RESET_NODES_POSITIONS; constructor() {}
}
export class ToggleAutoNetworkExpand implements Action {
    public readonly type = ActionTypes.TOGGLE_AUTO_EXPAND; 
    constructor() {}
}
export class AddSkewedNotification implements Action {
    public readonly type = ActionTypes.ADD_SKEWED_NOTIFICATION; 
    constructor(public payload: INode) {}
}
export class AddDNDBNotification implements Action {
    public readonly type = ActionTypes.ADD_DNDB_NOTIFICATION; 
    constructor(public payload: INode) {}
}
export class AddFRDAMLCaseNotification implements Action { 
    public readonly type = ActionTypes.ADD_FRDAML_CASE_NOTIFICATION; 
    constructor(public payload: INode) {}
}
export class LoadExternalData implements Action {
    public readonly type = ActionTypes.LOAD_EXTERNAL_DATA; 
    constructor(public payload: { rootNodeId: string; data: INwData; maxNodeCount: number;}) {}
}
export type Actions = LoadNodesByEntityId
                        | LoadNodesByEntityIdFail 
                        | ExcludeNodeTypes
                        | ExpandNode 
                        | SetEntityId
                        | ToggleLabel
                        | TurnOffDisplaySpinner 
                        | CollapseNode
                        | ResetGraph 
                        | ResetNodesPositions 
                        | AddSkewedNotification
                        | AddDNDBNotification 
                        | SelectNode
                        | SelectOnlyClickedNode 
                        | UnselectAllNodes 
                        | ToggleAutoNetworkExpand 
                        | AddFRDAMLCaseNotification 
                        | LoadExternalData;
    

