import { NgModule } from '@angular/core';
import { GraphComponent } from './components/graph/graph.component';
import { RootStateModule } from "./root-state.module";
import { ZoomableDirective } from "./directives/zoomable.directive";
import { D3Service } from "./services/d3.service";
import { GraphEngineService } from "./services/graph-engine.service";
import { FadeinNotificationService } from "./services/fadein-notification.service";
import { DispatchNodeLoadService } from "./services/dispatch-node-load.service";
import { NodeRelationService } from "./services/node-relation.service";
import { NotificationBrokerService } from "./services/notification-broker.service";
import { ConfigParserService } from "./services/config-parser.service";
import { DataBuilderService } from "./services/data-builder.service";


@NgModule({
  declarations: [GraphComponent,
                  ZoomableDirective],
  imports: [
    RootStateModule
  ],
  providers: [
    D3Service, 
    GraphEngineService, 
    NotificationBrokerService, 
    NodeRelationService, 
    DispatchNodeLoadService, 
    ConfigParserService, 
    DataBuilderService, 
    FadeinNotificationService
  ],
  exports: [GraphComponent]
})
export class NetworkGraphModule { }
