import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State as GraphState, STORE_GRAPH_SLICE_NAME } from '../../store/state'; 
import { take } from 'rxjs/operators'; 
import { ExpandNode, AddSkewedNotification, CollapseNode, ResetGraph, ToggleLabel, SelectNode,
  UnselectAllNodes, SelectOnlyClickedNode, ResetNodesPositions, LoadExternalData } from '../../store/actions';

@Component({
  selector: 'network-graph', 
  changeDetection: ChangeDetectionStrategy.OnPush, 
  templateUrl: 'graph.component.html', 
  styleUrls: ['graph.component.css']
})
export class GraphComponent implements OnInit {
  containerHeight = window.innerHeight;
  public options = { width: 1295, height: 725 }; 

  constructor(private store$: Store<GraphState>) { }

  ngOnInit() {

  }

  viewportClick() { 
    this.store$.pipe(take(1)).subscribe((stateVal: any) => {
      const nwState = stateVal[STORE_GRAPH_SLICE_NAME]; 
      if(Array.isArray(nwState.selectedNodes) && nwState.selectedNodes.length > 0) {
        this.store$.dispatch(new UnselectAllNodes());
      }
    });
  }

}
