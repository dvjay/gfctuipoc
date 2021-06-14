import { SimulationNodeDatum, SimulationLinkDatum, forceSimulation, forceManyBody, forceCollide, forceLink, forceCenter, forceX, forceY } from 'd3-force'; 
import { INode, IEdge } from '../models/nw-data'; 
import { GraphAdapter } from '../models/graph-adapter'; 
import GraphData from '../models/graph-data';

export default class d3ForceAdapter implements GraphAdapter {
    private width: number; 
    private height: number; 
    private nodeRadius: number;

    constructor (viewPortWidth: any, viewPortheight: any, nodeRadius: any) {
        this.width = viewPortWidth; 
        this.height = viewPortheight; 
        this.nodeRadius = nodeRadius;
    }
    
    attachNodesPosition(data: GraphData) : Promise<void> { 
        return new Promise((resolutionFunc, rejectionFunc) => {
            let nodeKeys = []; 
            let nodes: any[] = []; 
            let links: any[] = []; 
            let linkDistance = 150; 
            
            data.nodes.forEach((value: INode, key: string) => {
                nodeKeys.push(key);
                nodes.push({id: value.nodeId, name: value.nodeId, x: value.x, y: value.y}); 
            }); 
            data.edges.forEach((value: IEdge) => {
                links.push({source: value.sourceNodeId, target: value.targetNodeId}); 
            }); 
            var simulation = forceSimulation(nodes)
                .force("charge", forceManyBody().distanceMax(this.height / 2).strength(-2000))
                .force('collide', forceCollide().radius(this.nodeRadius).iterations(10))
                .force("link", forceLink(links).distance(linkDistance).id((d: any) => {return d. id;}))
                .force("x", forceX(this.width / 2))
                .force("y", forceY(this.height / 2)) 
                .stop();

            simulation.tick (500);
            
            nodes.forEach((value: any) => {
                let _oldValue = data.nodes.get(value.name);
                _oldValue!.x = value.x;
                _oldValue!.y = value.y; 
            }); 
            resolutionFunc();
        });
    }
}