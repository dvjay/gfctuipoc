import { CommonModule } from '@angular/common'; 
import { NgModule } from '@angular/core'; 
import { EffectsModule } from '@ngrx/effects'; 
import { ActionReducer, ActionReducerMap, MetaReducer, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools'; 
import { NetworkGraphStateModule } from './network-graph-state.module';
import { graphReducer } from './store/reducer';

export const reducers: ActionReducerMap<any> = {
    nwGraph: graphReducer
}

export function logger(reducer: ActionReducer<any>) : ActionReducer<any> { 
    const output = (state: any, action: any) => {
        const result = reducer(state, action); 
        console.groupCollapsed(action.type);
        console.log('prev state', state); 
        console.log('action', action); 
        console.log('next state', result); 
        console.groupEnd(); 
        return result;
    };
    return output;
}
export const metaReducers: MetaReducer<any>[] = [logger];

@NgModule({
    imports: [
        CommonModule, 
        NetworkGraphStateModule, 
        StoreModule.forRoot(reducers, { metaReducers }), 
        EffectsModule.forRoot([]), 
        StoreDevtoolsModule.instrument({
            maxAge: 25, // Retains last 25 states
        })
    ],
    declarations: []
})
export class RootStateModule {}
