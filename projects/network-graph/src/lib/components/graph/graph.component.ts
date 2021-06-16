import { EMPTY_STRING } from '../../utils';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { State as GraphState, STORE_GRAPH_SLICE_NAME } from '../../store/state'; 
import { debounceTime, take } from 'rxjs/operators'; 
import { ExpandNode, AddSkewedNotification, CollapseNode, ResetGraph, ToggleLabel, SelectNode,
  UnselectAllNodes, SelectOnlyClickedNode, ResetNodesPositions, LoadExternalData } from '../../store/actions';
import { DataBuilderService } from '../../services/data-builder.service';
import { ConfigParserService } from '../../services/config-parser.service';
import { IEdge, INode } from '../../models/nw-data';
import { Observable } from 'rxjs';
import { GraphEngineService } from '../../services/graph-engine.service';
import * as graphSelectors from '../../store/selectors'; 
import { Overlay } from '@angular/cdk/overlay';
import { FadeinNotificationService } from '../../services/fadein-notification.service';
import { GraphLog } from '../../models/graph-log';

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
  contextMenuOptions = [
    { id: 0, label: 'Collapse'}, // {id: 1, label: 'Open in new tab'} 
  ];
  /* context menu properties - End */

  constructor(private ref: ChangeDetectorRef, 
              private store$: Store<GraphState>, 
              private dataBuilderService: DataBuilderService, 
              private configParserService: ConfigParserService,
              public graphEngineService: GraphEngineService,
              public overlay: Overlay, 
              public viewContainerRef: ViewContainerRef, 
              public fadeinNotificationService: FadeinNotificationService) { }

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
    this.selectDirectLinkedFilterByNodeType$.pipe(debounceTime(1000)).subscribe(
      (graphData: any) => {
        this.store$.pipe(take(1)).subscribe((val: any) => {
          let graphState = val[STORE_GRAPH_SLICE_NAME];
          if(graphState.rootNodeId) {
            this.graphEngineService.updateGraph(graphData);
          }
        });
      });
      this.selectMaxNodesExceeded$.subscribe(
        (maxNodesExceed: any) => { 
          if(maxNodesExceed === true) {
            this.fadeinNotificationService.add();
          }
        });
  }

  ngOnDestroy() {
    this.graphEngineService.ticker.unsubscribe(); 
    this.selectDirectLinkedFilterByNodeType$.unsubscribe();
    this.selectMaxNodesExceeded$.unsubscribe();
    window.removeEventListener('scroll', this.scroll, true);
    window.removeEventListener('wheel', this.scroll, true);
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

  
  contextMenuClick(optionId: number, node: INode) {
    switch(optionId) { 
      case 0:
        this.store$.dispatch(new CollapseNode({
          nodeId: node.nodeId, 
          currentVisibleNodes: this.nodes, 
          currentVisibleEdges: this.links
        }));
        break; 
      case 1:
        // Context menu Item 
        break;
      default:
        break;
    }
  }

  trackItem(index: number, item: INode) {
    return item.nodeId;
  }

  resetNodePositions() {
    this.store$.dispatch(new ResetNodesPositions());
  }

  notifyIsSkewed(node: any) {
    this.store$.pipe(take(1)).subscribe((stateVal: any) => {
      const network = stateVal[STORE_GRAPH_SLICE_NAME];
      if(typeof (network.skewedNodeLogs as GraphLog[]).find((x: any) => x.nodeIds.indexOf((node as INode).nodeId) > -1) == 'undefined') {
        this.store$.dispatch(new AddSkewedNotification(node as INode));
      }
    })
  }
    
  selectNode(nodeId: string) {
    this.store$.dispatch(new SelectNode(nodeId));
  }
  
  selectOnlyClickedNode(nodeId: string) {
    this.store$.dispatch(new SelectOnlyClickedNode(nodeId));
  }
  
  expandNode(node: INode) { 
    this.store$.dispatch(new ExpandNode ({
      nodeId: node.nodeId, 
      currentVisibleNodes: this.nodes,
      currentVisibleEdges: this.links 
    }));
  }
  
  onOpenContextMenu(event: MouseEvent, currentNode: INode, nodeIdx: number) {
    this.isContextMenuOpen = true; 
    this.latestFocusedNode = currentNode; 
    this.latestFocusedNodeRef = this.nodeRefs!.toArray()[nodeIdx];
  }
  
  toggleLabel() {
    this.store$.dispatch (new ToggleLabel());
  }
  
  OnChangeNumHops() {
    this.nodes = []; 
    this.links = []; 
    this.ref.markForCheck();
    this.store$.dispatch(new ResetGraph()); 
    // this.numHopChanged.emit(this.numHops);
  }
}
