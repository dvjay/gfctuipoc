import { EventEmitter, Injectable } from '@angular/core'; 
// @ts-ignore
import * as d3 from 'd3-force'; 
import GraphData from '../models/graph-data'; 
import { INode, IEdge } from '../models/nw-data'; 
import { GraphAdapter } from '../models/graph-adapter';
//import d3ForceAdapter from '../graph-adapters/d3-force.adapter'; 
import WebcolaAdapter from '../graph-adapters/webcola.adapter';

@Injectable() 
export class GraphEngineService {
    // public simulation: d3.Simulation<any, any>; 
    public simulation: any; 
    private adapter: GraphAdapter | undefined; 
    private nodeRadius = 23; 
    //public data: GraphData = {nodes: new Map<string, node>(), edges: new Map<string, link>() }; 
    public filteredData: GraphData = { nodes: new Map<string, INode>(), edges: new Map<string, IEdge>() }; 
    // public dataSource: Event Emitter<GraphData> = new EventEmitter(); 
    public ticker: EventEmitter<any> = new EventEmitter(); 
    public options = { width: 1295, height: 725 }; 
    public nodes: INode[] | undefined; 
    public links: IEdge[] | undefined;
    
    constructor() {
        //this.adapter = new d3ForceAdapter(this.options.width, this options.height, this.nodeRadius); 
        this.adapter = new WebcolaAdapter(this.options.width, this.options.height, this.nodeRadius); 
        this.initSimulation();
    }
    
    private initSimulation() { 
        if (!this.simulation) { 
            this.simulation = d3.forceSimulation([])
                .force("charge", d3.forceManyBody().strength(-2000))
                .force('collide', d3.forceCollide().radius(this.nodeRadius)) 
                .force("link", d3.forceLink([]).id(function (d: any) { return d.id; })) 
                .stop();

            this.simulation.on('tick', () => {
                this.ticker.emit({nodes: this.nodes, links: this. links });
            });
            this.simulation.on('end', function () {
                console.log("Simulation ended");
            });
        }
    }

    async updateGraph(data: GraphData) { 
        if(!data || !data.nodes || ! data.nodes.size) {
            this.nodes = []; 
            this.links = []; 
            this.ticker.emit({nodes: this.nodes, links: this.links }); 
            return;
        }
        if(!this.simulationRequired(Array.from(data.nodes.values()))) {
            this.nodes = Array.from(data.nodes.values()); 
            this.links = Array.from(data.edges.values()); 
            this.ticker.emit({ nodes: this.nodes, links: this.links }); 
            return;
        }
        await this.adapter!.attachNodesPosition(data); 
        this.nodes = Array.from(data.nodes.values()); 
        this.links = Array.from(data.edges.values()); 
        this.simulation.stop().nodes(this.nodes); 
        let forceLinks = this.simulation.force("link") as any; 
        forceLinks.links(this.links); 
        this.simulation.alpha(0).restart();
    }
    
    nodesEqual(previousNodes: INode[], currentNodes: INode[]): boolean { 
        if(previousNodes === currentNodes) {
            return true;
        }
        if(previousNodes == null || currentNodes == null) {
            return false;
        }
        if(previousNodes.length != currentNodes.length) {
            return false;
        }
        for(let i = 0; i < currentNodes.length; ++i) { 
            if (previousNodes.indexOf(currentNodes[i]) < 0) {
                return false;
            }
        }
        return true;
    }
    
    simulationRequired(currentNodes: INode[]): boolean { 
        if(Array.isArray(currentNodes) && currentNodes.length > 0) { 
            for(const iterator of currentNodes) { 
                if(typeof iterator.x == 'undefined') {
                    return true;
                }
            }
        }
        return false;
    }
}