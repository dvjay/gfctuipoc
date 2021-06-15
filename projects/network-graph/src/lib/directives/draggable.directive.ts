import { Directive, Input, ElementRef, OnInit } from "@angular/core";
import { D3Service } from '../services/d3.service';
import { INode } from '../models/nw-data';
import { GraphEngineService } from '../services/graph-engine.service';

@Directive({
    selector: '[draggableNode]'
})
export class DraggableDirective implements OnInit {
    @Input('draggableNode') draggableNode: INode;
    @Input('draggableInGraph') draggableInGraph: GraphEngineService;

    constructor(private d3Service: D3Service, private _element: ElementRef) {

    }

    ngOnInit() {
        this.d3Service.applyDraggableBehaviour(this._element.nativeElement, this.draggableNode, this.draggableInGraph);
    }
}