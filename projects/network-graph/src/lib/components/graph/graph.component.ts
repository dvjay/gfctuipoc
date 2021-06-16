import { EMPTY_STRING } from '../../utils';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { State as GraphState, STORE_GRAPH_SLICE_NAME } from '../../store/state'; 
import { take } from 'rxjs/operators'; 
import { ExpandNode, AddSkewedNotification, CollapseNode, ResetGraph, ToggleLabel, SelectNode,
  UnselectAllNodes, SelectOnlyClickedNode, ResetNodesPositions, LoadExternalData } from '../../store/actions';
import { DataBuilderService } from '../../services/data-builder.service';
import { ConfigParserService } from '../../services/config-parser.service';
import { IEdge, INode } from '../../models/nw-data';
import { Observable, Subject } from 'rxjs';
import { GraphEngineService } from '../../services/graph-engine.service';
import * as graphSelectors from '../../store/selectors'; 

const DEFAULT_MAX_NODES = 200;
const DEFAULT_NUM_HOPS = 2;
const DEFAULT_WIDGET_HEIGHT = 1000;
const DEFAULT_WIDGET_WIDTH = 1295;

@Component({
  selector: 'network-graph', 
  changeDetection: ChangeDetectionStrategy.OnPush, 
  templateUrl: 'graph.component.html', 
  styleUrls: ['graph.component.css']
})
export class GraphComponent implements OnInit, OnChanges {
  @Input() rootNodeId = EMPTY_STRING;
  @Input() dataLoading = false;
  @Input() config = {};
  @Input() data = {};
  nodes: INode[] = []; 
  links: IEdge[] = [];
  numHops = DEFAULT_NUM_HOPS; 
  maxNodes = DEFAULT_MAX_NODES;
  containerHeight = window.innerHeight;
  options = { width: DEFAULT_WIDGET_WIDTH, height: DEFAULT_WIDGET_HEIGHT };
  SVG_MARGIN = 10;
  @ViewChild('graphcontainer', { static: false }) graphContainer: ElementRef;

  /* Observables - Begin */
  hideLabel$: Observable<boolean> | undefined;
  autoNetworkExplore$: Observable<boolean> | undefined;
  autoNetworkExpand$: Observable<boolean> | undefined;
  rootEntityDataLoading$: Observable<boolean> | undefined;
  rootNodeId$: Observable<string | undefined> | undefined;
  selectedNodes$: Observable<INode[]> | undefined;
  selectDirectLinkedFilterByNodeType$: any;
  selectMaxNodesExceeded$: any;
  /* Observables - End */

  /* context menu properties - Begin */
  isContextMenuOpen = false; 
  latestFocusedNodeRef: ElementRef | undefined; 
  latestFocusedNode: INode | undefined;
  @ViewChildren("noderef") nodeRefs: QueryList<ElementRef> | undefined; 
  resize$ = new Subject<any>(); 
  contextMenuOptions = [
    { id: 0, label: 'Collapse'}, // {id: 1, label: 'Open in new tab'} 
  ];
  /* context menu properties - End */

  constructor(private ref: ChangeDetectorRef, 
              private store$: Store<GraphState>, 
              private dataBuilderService: DataBuilderService, 
              private configParserService: ConfigParserService,
              public graphEngineService: GraphEngineService) { }

  ngOnInit() {
    window.addEventListener('scroll', this.scroll, true); 
    window.addEventListener('wheel', this.scroll, true);

    this.hideLabel$ = this.store$.select(graphSelectors.selectIsHideLabel);
      this.autoNetworkExpand$ = this.store$.select(graphSelectors.selectAutoNetworkExpand); 
      this.rootNodeId$ = this.store$.select(graphSelectors.selectRootNodeId); 
      this.selectedNodes$ = this.store$.select(graphSelectors.selectSelectedNodes); 
      this.selectDirectLinkedFilterByNodeType$ = this.store$.select(graphSelectors.selectDirectLinkedFilterByNodeType); 
      this.selectMaxNodesExceeded$ = this.store$.select(graphSelectors.selectMaxNodesExceeded);
      this.store$.dispatch(new ResetGraph());
      
      this.graphEngineService.ticker.subscribe((d: any) => {
        this.nodes = d.nodes; 
        this.links = d.links; 
        this.ref.markForCheck();
      });
      this.configParserService.parseConfig(this.config);
      if(this.configParserService.nwRawConfig) {
        this.dataBuilderService.getNetworkData(this.data);
        console.log("checking nwData", this.dataBuilderService.nwData);
        this.store$.dispatch(new LoadExternalData({
          rootNodeId: this.rootNodeId!, 
          data: this.dataBuilderService.nwData, 
          maxNodeCount: this.maxNodes!
        }));
      }
  }

  ngOnChanges(changes: SimpleChanges) { 
    const { rootNodeId, config, data } = changes;
    if(!rootNodeId && !config && !data) {
      return;
    }

    this.configParserService.parseConfig(this.config); 
    this.numHops = this.configParserService.nwConfig.numHops; 
    this.maxNodes = this.configParserService.nwConfig.maxNodeCount;
    this.dataBuilderService.getNetworkData(this.data);
    this.store$.dispatch(new LoadExternalData({rootNodeId: this.rootNodeId, 
      data: this.dataBuilderService.nwData, 
      maxNodeCount: this.maxNodes
    }));
  }

  ngAfterViewInit() { 
    this.options.width = (this.graphContainer.nativeElement as HTMLElement).offsetWidth;
  }

  viewportClick() { 
    this.store$.pipe(take(1)).subscribe((stateVal: any) => {
      const nwState = stateVal[STORE_GRAPH_SLICE_NAME]; 
      if(Array.isArray(nwState.selectedNodes) && nwState.selectedNodes.length > 0) {
        this.store$.dispatch(new UnselectAllNodes());
      }
    });
  }

  scroll() {
    this.isContextMenuOpen = false;
    if(this.ref) {
      this.ref.markForCheck();
    }
  }

}
