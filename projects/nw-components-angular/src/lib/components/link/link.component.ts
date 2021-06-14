import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { IEdge } from '../../models/nw-data'; 
import { Subscription} from 'rxjs'; 
import { NotificationBrokerService } from '../../services/notification-broker.service'; 
import { NodeRelationService, CurrentMouseOverNodeOrEdge } from '../../services/node-relation.service';

@Component({
    selector: '[link]', 
    templateUrl: './link.component.html', 
    styleUrls: ['./link.component.css']
})
export class LinkComponent {
    @Input('link') link: IEdge | any; 
    @Input('hideLabel') hideLabel: boolean | undefined;
    nodeRadius = 20; 
    sourceRadius: number; 
    targetRadius: number; 
    linkOpacity = 1; 
    minLabelLength = 40; 
    notificationMoveOverSub: Subscription; 
    notificationMoveOutSub: Subscription; 
    nodeRelationMoveOverSub: Subscription; 
    nodeRelationMoveOutSub: Subscription;
    
    constructor (private notificationBrokerService: NotificationBrokerService, private nodeRelationService: NodeRelationService) { 
        this.sourceRadius = this.nodeRadius + 2; 
        this.targetRadius = this.nodeRadius + 5.5; 
        this.notificationMoveOverSub = notificationBrokerService.notificationMoveOver$.subscribe(
            () => {
                this.linkOpacity = 0.2;
            });
        this.notificationMoveOutSub = notificationBrokerService.notificationMoveOut$.subscribe(
            () => {
                this.linkOpacity = 1;
            });
        this.nodeRelationMoveOverSub = nodeRelationService.notificationMoveOver$.subscribe(
            (message: CurrentMouseOverNodeOrEdge) => { 
            if(message.node) { 
                if(message.node.nodeId === this.link.sourceNodeId || message.node.nodeId === this.link.targetNodeId) {
                    this.linkOpacity = 1;
                } else {
                    this.linkOpacity = 0.2;
                }
            } else if(message.edge) { 
                if(message.node!.nodeId === this.link.sourceNodeId || message.node!.nodeId === this.link.targetNodeId) {
                    this.linkOpacity = 1;
                } else {
                    this.linkOpacity = 0.2;
                }
            } else {
                this.linkOpacity = 1;
            }
        });
        
        this.nodeRelationMoveOutSub = nodeRelationService.notificationMoveOut$.subscribe(
            (message: CurrentMouseOverNodeOrEdge) => {
                this.linkOpacity = 1;
            });
    }

    ngOnDestroy() {
        this.notificationMoveOverSub.unsubscribe(); 
        this.notificationMoveOutSub.unsubscribe();
    }
    
    get sourcePoint(): {x: number, y: number} {
        const link = this.link as any; 
        return this.getPtBetween2PtsfromDistance({x: link.source.x, y: link.source.y}, {x: link.target.x, y: link.target.y}, this.sourceRadius);
    }
    
    get targetPoint(): {x: number, y: number} {
        const link = this.link as any; 
        return this.getPtBetween2PtsfromDistance({x: link.target.x, y: link.target.y}, {x: link.source.x, y: link.source.y}, this.targetRadius);
    }

    get centerPoint(): {x: number, y: number} {
        const link = this.link as any; 
        return this.getPtBetween2Pts({x: link.target.x, y: link.target.y}, {x: link.source.x, y: link.source.y});
    }
    
    get labelRotation(): string {
        const link = this.link as any; 
        const rotation = this.getAngle({x: link.source.x, y: link.source.y}, {x: link.target.x, y: link.target.y}); 
        if(link.target.x > link.source.x) {
            return `rotate(${rotation} ${this.centerPoint.x},${this.centerPoint.y})`;
        } else {
            return `rotate(${rotation + 180} ${this.centerPoint.x},${this.centerPoint.y})`;
        }
    }
    
    getPtBetween2PtsfromDistance(p1: {x: number, y: number}, p2: {x: number, y: number}, distance: number): {x: number, y: number} {
        const distance_ratio = distance / this.getDistanceBetwnPoints (p1, p2); 
        const x = p1.x + distance_ratio * (p2.x - p1.x); 
        const y = p1.y + distance_ratio * (p2.y - p1.y); 
        return {x, y};
    }

    getPtBetween2Pts(p1: {x: number, y: number}, p2: {x: number, y: number}): {x: number, y: number} {
        const x = p1.x + 0.5 * (p2.x - p1.x); 
        const y = p1.y + 0.5 * (p2.y - p1.y); 
        return {x, y};
    }
    
    getDistanceBetwnPoints(p1 : {x: number, y: number}, p2: {x: number, y: number}) {
        const dx = p2.x - p1.x; 
        const dy = p2.y - p1.y; 
        const square = (distance: any) => distance * distance;
        return Math.sqrt(square(dx) + square(dy));
    }
    
    getAngle(p1: {x: number, y: number}, p2: {x: number, y: number}) { 
        let dy = p2.y - p1.y; 
        let dx = p2.x - p1.x; 
        let theta = Math.atan2(dy, dx); 
        theta *= 180 / Math.PI; 
        return theta;
    }              
}