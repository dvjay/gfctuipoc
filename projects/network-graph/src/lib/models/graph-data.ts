import { INode, IEdge } from './nw-data';

export default interface GraphData {
    nodes: Map<string, INode>;
    edges: Map<string, IEdge>;
}