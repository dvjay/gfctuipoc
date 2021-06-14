import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router'; 
// import { HttpClient } from '@angular/common/http'; 
// import { Observable } from 'rxjs'; 
// import { of } from 'rxjs/observable/of'; 
// import { concatMap } from 'rxjs/operators';
@Component({
    selector: 'network-graph-container', 
    templateUrl: 'graph-container.component.html', 
    styleUrls: ['graph-container.component.css']
})
export class GraphContainerComponent { //implements OnInit, AfterViewInit, OnDestroy {
    // @Input('rootNodeId') rootNodeId: string; 
    // dataLoading: boolean = false; 
    // data: any; 
    // config: any; 
    // private _nwConfigJsonURL = 'assets/mock-data/nwconfig.json'; 
    // sub; 
    
    // constructor (private http: HttpClient, private Activatedroute: ActivatedRoute) { } 
    
    // ngOnInit() { 
    //     this.sub = this._Activatedroute.paramMap.subscribe(params => {
    //         this.dataLoading = false;
    //         of(this._nwConfigJsonURL).pipe(concatMap((url: string) => this.getJSON(url)))
    //         .subscribe((result) => {
    //             this.config = result;
    //             console.log("config", result);
    //         });
    //     });
    // }
    // ngAfterViewInit() {
    //     this.onNumHopChange(2);
    // }
    
    // async onNumHopChange(numHop: number) {
    //     if(this.rootNodeId && numHop) {
    //         this.dataLoading = true;
    //         const apiRoot = "https://gfct-dev.bankofamerica.com/gfcranalytics';
    //         let apiURL = apiRoot + "/get_network_nodes?node_id=" + this.rootNodeId + "&node_type=" + "gfctEntity" + "&num_hops=" + numHop;
    //         this.data = await this.http.get(apiURL).toPromise();
    //         this.dataLoading = false;
    //     }
    // }

    // public getJSON(url: string): Observable<any> {
    //     return this.http.get(url);
    // }

    // ngOnDestroy() {
    //     this.sub.unsubscribe();
    // }
}