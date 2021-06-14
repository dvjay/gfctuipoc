import { Directive, ElementRef, Input, OnInit } from "@angular/core";
import { D3Service } from '../services/d3.service';

@Directive({
    selector: '[zoomableOf]'
})
export class ZoomableDirective implements OnInit {
    @Input('zoomableOf') zoomableOf: ElementRef | undefined;

    constructor(private d3Service: D3Service, private _element: ElementRef) {

    }

    ngOnInit() {
        this.d3Service.applyZoomableBehaviour(this.zoomableOf, this._element.nativeElement);
    }
}