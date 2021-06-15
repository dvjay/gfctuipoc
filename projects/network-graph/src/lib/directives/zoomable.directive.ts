import { Directive, ElementRef, Input, OnInit } from "@angular/core";
import { D3Service } from '../services/d3.service';

@Directive({
    selector: '[zoomableOf]'
})
export class ZoomableDirective implements OnInit {
    @Input('zoomableOf') zoomableOf: ElementRef;

    constructor(private _element: ElementRef, private d3Service: D3Service) {

    }

    ngOnInit() {
        this.d3Service.applyZoomableBehaviour(this.zoomableOf, this._element.nativeElement);
    }
}