import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { Observable, of } from 'rxjs'; 
import { concatMap} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  // rootNodeId: string = "90098302633"; 
  @Input('rootNodeId') rootNodeId: 
  string; dataLoading: boolean = false; 
  data: any; 
  config: any; 
  private _nwConfigJsonURL = 'assets/mock-data/nwconfig.json'; 
  private _nwDataJsonURL = 'assets/mock-data/sampleData.json';
  // private _nwConfigJsonURL = 'assets/mock-data/nwconfig.json'; 
  // private _nwDataJsonURL = 'assets/mock-data/tgSampleData.json'; 
  

  sub;

  constructor(private http: HttpClient) {
  }

  ngOnInit() { 
// this.rootNodeId = '90098302633'; //TG 
      // this.rootNodeId = '900126917570'; 
      this.dataLoading = false;
      of(this._nwConfigJsonURL).pipe(concatMap((url: string) => this.getJSON(url)))
      .subscribe((result) => {
        this.config = result; 
        console.log("config", result);
      });
  }


  ngAfterViewInit() {
    // this.onNumHopChange(2);
    // this.dataLoading = false;
      of(this._nwDataJsonURL).pipe(concatMap((url: string) => this.getJSON(url)))
      .subscribe((result) => {
        this.data = result; 
        console.log("config", result);
      });
  }

  onNumHopChange(numHop: number) { 
    console.log(numHop);
  }
  
  public getJSON(url: string): Observable<any> {
    return this.http.get(url);
  }

  ngOnDestroy() {
    console.log("On Destroy");
    this.sub.unsubscribe();
  } 
}

