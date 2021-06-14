import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { A11yModule } from "@angular/cdk/a11y";
import { GraphComponent } from "./components/graph/graph.component";
import { GraphContainerComponent } from "./components/graph-container/graph-container.component";
import { D3Service } from "./services/d3.service";
import { GraphEngineService } from "./services/graph-engine.service";
import { FadeinNotificationService } from "./services/fadein-notification.service";
import { DispatchNodeLoadService } from "./services/dispatch-node-load.service";
import { NodeRelationService } from "./services/node-relation.service";
import { NotificationBrokerService } from "./services/notification-broker.service";
import { ConfigParserService } from "./services/config-parser.service";
import { DataBuilderService } from "./services/data-builder.service";
import { SpinnerComponent } from "./components/spinner/spinner.component";
import { LinkComponent } from "./components/link/link.component";
import { NodeComponent } from "./components/node/node.component";
import { NodeLabelComponent } from "./components/node-label/node-label.component";
import { ZoomableDirective } from "./directives/zoomable.directive";
import { DraggableDirective } from "./directives/draggable.directive";
import { TooltipDirective } from "./directives/tooltip.directive";
import { NodeMenuOptionDirective } from "./directives/node-menu-option.directive";
import { LegendComponent } from "./components/legend/legend.component";
import { EmptyComponent } from "./components/empty/empty.component";
import { FadeinNotificationComponent } from "./components/fadein-notification/fadein-notification.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { OverlayModule } from "@angular/cdk/overlay";
import { FormsModule } from "@angular/forms";
import { RootStateModule } from "./root-state.module";
import { MatCheckboxModule, MatToolbarModule, 
    MatSelectModule, MatProgressSpinnerModule, 
    MatIconModule, 
    MatSlideToggleModule, 
    MatMenuModule, 
    MatSnackBarModule, 
    MatDividerModule, 
    MatTooltipModule, MatListModule, 
    MatCardModule,} from "@angular/material";

@NgModule({
    imports: [
        CommonModule, 
        BrowserAnimationsModule,
        FormsModule, 
        OverlayModule, 
        A11yModule,
        RootStateModule,
        MatListModule, 
        MatCardModule, 
        MatCheckboxModule, 
        MatToolbarModule, 
        MatSelectModule, 
        MatProgressSpinnerModule, 
        MatIconModule, 
        MatSlideToggleModule, 
        MatMenuModule, 
        MatSnackBarModule, 
        MatDividerModule, 
        MatTooltipModule,
    ],
    declarations: [ SpinnerComponent,
                    GraphComponent,
                    LinkComponent,
                    NodeComponent,
                    NodeLabelComponent,
                    ZoomableDirective,
                    DraggableDirective,
                    TooltipDirective,
                    NodeMenuOptionDirective,
                    LegendComponent,
                    GraphContainerComponent,
                    EmptyComponent,
                    FadeinNotificationComponent],
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
    