import { Injectable } from '@angular/core'; 
//@ts-ignore
import * as d3 from 'd3'; 
import { INode} from '../models/nw-data'; 
import { GraphEngineService } from './graph-engine.service';

@Injectable() 
export class D3Service {
    constructor() { }
    /** Bind a pan/zoom behaviour to svg element */ 
    applyZoomableBehaviour(svgElement: any, containerElement: any) {
        let svg, container: d3.Selection<any, unknown, null, undefined>, zoomed, zoom;
        svg = d3.select(svgElement); 
        container = d3.select(containerElement);
        zoomed = () => {
            const transform = d3.event.transform; 
            container.attr('transform', 'translate(' + transform.x + ',' + transform.y + ') scale(' + transform.k + ')');
        }
        zoom = d3.zoom().on('zoom', zoomed); 
        svg.call(zoom); 
        svg.on("dblclick.zoom", null);
    }
    
    triggerZoomToFit(svgElement: any) {
        console.log(svgElement);
    }
    
    graphBounds(nodes: INode[]) { 
        var x = Number.POSITIVE_INFINITY, X = Number. NEGATIVE_INFINITY, y = Number.POSITIVE_INFINITY, Y = Number.NEGATIVE_INFINITY; 
        nodes.forEach((v: any) => {
            x = Math.min(x, v.x - 50 / 2); 
            X = Math.max(X, v.x + 50 / 2); 
            y = Math.min(y, v.y - 50 / 2); 
            Y = Math.max(Y, v.y + 50 / 2);
        });
        return { x: x, X: X, y: y, Y: Y };
    }
    
    applyDraggableBehaviour(element: any, node: INode, graph: GraphEngineService) {
        const d3element = d3.select(element);

        function started() {
            /** Preventing propogation of dragstart to parent elements */
            d3.event.sourceEvent.stopPropagation();

            if(!d3.event.active) {
                graph.nodes!.forEach(n => {
                    n.fx = n.x;
                    n.fy = n.y;
                });
                graph.simulation.alphaTarget(0.1).restart();
            }

            d3.event.on('drag', dragged).on('end', ended);

            function dragged() {
                node.fx = d3.event.x;
                node.fy = d3.event.y;
            }
            
            function ended (event: any) { 
                if (!d3.event.active) {
                    graph.simulation.alphaTarget(0);
                    setTimeout(() => {
                        graph.simulation.stop();
                    }, 0);
                }
            }
        }
        
        d3element.call(d3.drag()
            .on('start', started));
    }
    
    createTooltip(element: any, node: INode) {
        const d3element = d3.select(element); 
        let titleElem = d3element.select("title");

        if(Array.isArray(node.nodeDescAttributes) && node.nodeDescAttributes.length > 0) {
            let textElems = titleElem.selectAll("text") 
                .data(node.nodeDescAttributes).enter().append("text");
            textElems.append("tspan").text((d: any) => d.title + ": ").attr("font-weight", "bold");
            textElems.append("tspan").text((d: any) => {
                                return (typeof node[d.attribute] === 'undefined'? '-' : node[d.attribute]) + "\n";
            });
        } else {
            titleElem.selectAll("text") 
                .data([node.label])
                .enter().append("text")
                .text((d: any) => d);
        }
    }
}
