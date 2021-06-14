import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NetworkGraphModule } from '../../../nw-components-angular/src/lib/network-graph.module';
import { HttpClientModule } from '@angular/common/http';
import { GraphComponent } from 'projects/nw-components-angular/src/lib/components/graph/graph.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NetworkGraphModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent, GraphComponent]
})
export class AppModule { }
