import * as cola from 'webcola'; 
import { INode, IEdge } from '../models/nw-data'; 
import { GraphAdapter } from '../models/graph-adapter'; 
import GraphData from '../models/graph-data'; 
import * as d3 from 'd3';

export default class WebcolaAdapter implements GraphAdapter {
    private width: number; 
    private height: number; 
    private nodeRadius: number; 
    private d3cola: any;

    constructor(viewPortWidth: any, viewPortheight: any, nodeRadius: any) {
        this.width = viewPortWidth; 
        this.height = viewPortheight; 
        this.nodeRadius = nodeRadius; 
        this.d3cola = cola.d3adaptor(d3)
                        .size([viewPortWidth, viewPortheight])
                        .avoidOverlaps(true)
                        .defaultNodeSize(60)
                        .symmetricDiffLinkLengths(100,0.7); 
                        //.linkDistance(150);
    }
    
    attachNodesPosition(data: GraphData) : Promise<void> { 
        return new Promise((resolutionFunc, rejectionFunc) => {
            let nodeKeys: any[] = []; 
            let nodes: any[] = []; 
            let links: any[] = []; 
            let linkDistance = 150; 
            let groupMap = {}; 
            let nodeIdx = 0; 
            // let groups = [];
            
            data.nodes.forEach((value: INode, key: string) => {
                nodeKeys.push(key);
                nodes.push({name: value.nodeId, x: value.x, y: value.y}); 
                ++nodeIdx;
            });

            data.edges.forEach((value: IEdge) => {
                let sourceIdx = nodeKeys.indexOf(value.sourceNodeId); 
                let targetIdx = nodeKeys.indexOf(value.targetNodeId); 
                links.push({source: sourceIdx, target: targetIdx});
            });

            // for(let g in groupMap) {
            //     groups.push({ id: g, leaves: groupMap[g] });
            // }
            
            if(nodes.length > 100) {
                linkDistance = 250;
            }
            
            if(nodes.length > 200) {
                linkDistance = 400;
            }

            this.d3cola
                .linkDistance(linkDistance)
                .nodes(nodes) 
                .links (links)
                // groups (groups) 
                // .jaccardLinkLengths(linkDistance, 0.5) 
                // .flowLayout('x', 100) 
                .avoidOverlaps(true) 
                .start(50, 15, 20);

            this.d3cola.stop();
            nodes.forEach((value: any) => {
                let _oldValue = data.nodes.get(value.name); 
                _oldValue!.x = value.x;
                _oldValue!.y = value.y; 
            }); 
            resolutionFunc();
        });
    }
}
    