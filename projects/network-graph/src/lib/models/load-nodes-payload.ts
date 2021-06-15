import { INode } from './nw-data';

export interface LoadNodesPayload {
    rootNodeId: string;
    nodesToLoad: INode[];
    currentVisibleNodes: INode[];
    loadByClick: boolean;
}