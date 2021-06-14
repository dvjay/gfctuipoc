import { Component, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, AfterViewInit, Input, ViewContainerRef,
  ElementRef, ViewChildren, QueryList, SimpleChanges, HostListener, OnDestroy, Output, EventEmitter } from '@angular/core'; 
import { debounceTime, take } from 'rxjs/operators'; 
import { GraphEngineService } from '../../services/graph-engine.service'; 
import { Store } from '@ngrx/store'; 
import { State as GraphState, STORE_GRAPH_SLICE_NAME } from '../../store/state'; 
import { ExpandNode, AddSkewedNotification, CollapseNode, ResetGraph, ToggleLabel, SelectNode,
  UnselectAllNodes, SelectOnlyClickedNode, ResetNodesPositions, LoadExternalData } from '../../store/actions'; 
import * as graphSelectors from '../../store/selectors'; 
import { Observable, Subject } from 'rxjs'; 
import { Overlay } from '@angular/cdk/overlay'; 
import { GraphLog} from '../../models/graph-log'; 
import { INode, IEdge } from '../../models/nw-data'; 
import { ConfigParserService } from '../../services/config-parser.service'; 
import { DataBuilderService } from '../../services/data-builder.service'; 
import { toInteger as lodashToInteger } from 'lodash'; 
import { FadeinNotificationService } from '../../services/fadein-notification.service';

@Component({
  selector: 'network-graph', 
  changeDetection: ChangeDetectionStrategy.OnPush, 
  templateUrl: 'graph.component.html', 
  styleUrls: ['graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input('dataLoading') dataLoading?: boolean;// Independent/Optional 
  @Input('rootNodeId') rootNodeId: string | undefined; // Mandatory 
  @Input('config') config: any; // Mandatory 
  @Input('data') data?: any; //Optional 
  numHops: number | undefined; 
  maxNodes: number | undefined;
  // @Output("maxNodesChanged") maxNodesChanged; 
  @Output("numHopChanged") numHopChanged = new EventEmitter();
  options: { width: number, height: number }; 
  containerHeight: number | undefined;
  nodes: INode[] = []; 
  links: IEdge[] = []; 
  isMouseOverSidebarSelectedNodes: boolean = false; 
  highlightNodesFromSidebar: string[] = []; 
  hideLabel$: Observable<boolean> | undefined;
  autoNetworkExplore$: Observable<boolean> | undefined;
  autoNetworkExpand$: Observable<boolean> | undefined;
  rootEntityDataLoading$: Observable<boolean> | undefined;
  rootNodeId$: Observable<string | undefined> | undefined;
  selectedNodes$: Observable<INode[]> | undefined;
  selectDirectLinkedFilterByNodeType$: any;
  selectMaxNodesExceeded$: any;
  
  /* context menu properties */
  isContextMenuOpen = false; 
  latestFocusedNodeRef: ElementRef | undefined; 
  latestFocusedNode: INode | undefined;
  @ViewChildren("noderef") nodeRefs: QueryList<ElementRef> | undefined; 
  resize$ = new Subject<any>(); 
  contextMenuOptions = [
    { id: 0, label: 'Collapse'}, // {id: 1, label: 'Open in new tab'} 
  ];
    
  constructor (public graphEngineService: GraphEngineService, private configParserService: ConfigParserService, 
                private dataBuilderService: DataBuilderService,
                private store$: Store<GraphState>, 
                private ref: ChangeDetectorRef, 
                public overlay: Overlay, 
                public viewContainerRef: ViewContainerRef, 
                public fadeinNotificationService: FadeinNotificationService) {
                  console.log("graph constructor called");
      this.options = graphEngineService.options;
    }

    @HostListener('window:resize', ['$event']) 
    onResize(event: any) {
      this.resize$.next({ width: event.target.innerWidth, height: event.target.innerHeight });
    }
    ngonChanges(changes: SimpleChanges) { 
      if (typeof changes['config'] !== "undefined" && typeof changes['config'].currentValue !== "undefined") {
        this.configParserService.parseConfig(changes['config'].currentValue); 
        this.numHops = this.configParserService.nwConfig.numHops; 
        this.maxNodes = this.configParserService.nwConfig.maxNodeCount;
      }
      if (typeof changes['data'] !== "undefined" && typeof changes['data'].currentValue !== "undefined") { 
        if(this.configParserService.nwRawConfig) {
          this.dataBuilderService.getNetworkData(this.data);
          console.log("checking nwData", this.dataBuilderService.nwData);
          this.store$.dispatch(new LoadExternalData({rootNodeId: this.rootNodeId!, 
            data: this.dataBuilderService.nwData, 
            maxNodeCount: this.maxNodes!
          }));
        }
      }
    }

    ngOnInit() {
      window.addEventListener('scroll', this.scroll, true); 
      window.addEventListener('wheel', this.scroll, true);
      /* Setting size of container and SVG - Begin */ 
      this.options.width = window.innerWidth; 
      // this.containerHeight = this.currentTab ? window.innerHeight - 250: window.innerHeight; 
      this.containerHeight = window.innerHeight; 
      this.resize$.pipe(debounceTime(300)).subscribe(
          sizeObj => {
            this.options.width = sizeObj.width; 
            // this.containerHeight = this.currentTab ? sizeObj.height - 250 : sizeObj.height; 
            this.containerHeight = sizeObj.height; 
            this.ref.markForCheck();
          });
      /* Setting size of container and SVG - End */
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

    ngAfterViewInit() { 
      console.log("checking graph component ngAfterViewInit")
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
      this.resize$.unsubscribe();
      this.graphEngineService.ticker.unsubscribe(); 
      this.selectDirectLinkedFilterByNodeType$.unsubscribe();
      this.selectMaxNodesExceeded$.unsubscribe();
      window.removeEventListener('scroll', this.scroll, true);
      window.removeEventListener('wheel', this.scroll, true);
    }

    scroll = (): void => {
      this.isContextMenuOpen = false;
      this.ref.markForCheck();
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
    
    viewportClick() { 
      this.store$.pipe(take(1)).subscribe((stateVal: any) => {
        const nwState = stateVal[STORE_GRAPH_SLICE_NAME]; 
        if(Array.isArray(nwState.selectedNodes) && nwState.selectedNodes.length > 0) {
          this.store$.dispatch(new UnselectAllNodes());
        }
      });
    }
    
    OnChangeNumHops() {
      this.nodes = []; 
      this.links = []; 
      this.ref.markForCheck();
      this.store$.dispatch(new ResetGraph()); 
      this.numHopChanged.emit(this.numHops);
    }    
  }
    