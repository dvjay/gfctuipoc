import GraphData from './graph-data';

export interface GraphAdapter {
    attachNodesPosition(data: GraphData): Promise<void>;
}