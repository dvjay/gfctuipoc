import { Component, Input, EventEmitter, ElementRef, OnChanges, Output, AfterViewInit,
    OnDestroy, SimpleChanges, ViewChild } from '@angular/core'; 
import { INode, IEdge, NeighboursStateType } from '../../models/nw-data'; 
import {NodeRelationService, CurrentMouseOverNodeOrEdge } from '../../services/node-relation.service'; 
import {Subscription} from 'rxjs';
@Component({
    selector: '[node-label]', 
    templateUrl: './node-label.component.html', 
    styleUrls: ['./node-label.component.css']
})
export class NodeLabelComponent {
    @Input('node-label') node: INode | undefined;//needed 
    @Input('hideLabel') hideLabel: boolean | undefined;//needed 
    nodeRelationMouseOverSub: Subscription; 
    nodeRelationMouseOutSub: Subscription; 
    blurThisNode: boolean = false;

    constructor(private nodeRelationService: NodeRelationService) {
        this.nodeRelationMouseOverSub = nodeRelationService.notificationMoveOver$.subscribe(
            (message: CurrentMouseOverNodeOrEdge) => { 
                if(message.node) { 
                    if(message.node === this.node) {
                        this.blurThisNode = false;
                    } else { 
                        if((Array.isArray(message.node.sourceIds) 
                            && message.node.sourceIds.indexOf(this.node!.nodeId) > -1) || (Array.isArray(message.node.targetIds) && message.node.targetIds.indexOf(this.node!.nodeId) > -1)) { 
                                this.blurThisNode = false;
                            } else {
                                this.blurThisNode = true;
                            } 
                        }
                    } else if (message.edge) {
                        if(message.node === this.node) {
                        } else {
                        }
                    } else {
                        //this.linkOpacity = 1;
                    }
                });
                
                
        this.nodeRelationMouseOutSub = nodeRelationService.notificationMoveOut$.subscribe(
            (message: CurrentMouseOverNodeOrEdge) => { 
                if(message.node) {
                    this.blurThisNode = false;
                } else if (message.edge) {
                } else {
                    //this.linkOpacity = 1;
                }
            });
    }

    get nodeOpacity() { 
        if(this.blurThisNode) {
            return 0.2;
        }
        return 1;
    }
}       
    