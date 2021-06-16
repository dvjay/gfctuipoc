import { Injectable } from '@angular/core';
import { defaultNwAttribute, defaultNwEdgeConfig, defaultNwNodeConfig, NwAttribute, NwEdge, NwNodeType } from '../models/nw-config'; 
import { defaultNwConfig, NwConfig, NwNode} from "../models/nw-config"; 
import { EMPTY_STRING, isArrayOfNonEmptyStrings, isStringNullorEmpty, toBoolean, toPositiveInteger } from "../utils"; 

interface NwRawConfig {
    [key: string]: any;
}

@Injectable()
export class ConfigParserService {
    public nwRawConfig: any; 
    public nwConfig: NwConfig = {...defaultNwConfig, node: null, edge: null}; 
    public nwNodeTypes = new Map<string, NwNodeType>();
    public processNodeWithUnknownNodeType = false;

    public parseConfig(config: any) {
        if(typeof config === 'object' && config !== null) {
            this.nwRawConfig = config; 
            this.setProcessNodeWithUnknownNodeType();
            this.setMandatoryConfig(); 
            this.setNodeConfig(); 
            this.setNodeTypesConfig(); 
            this.setEdgeConfig();
            this.setEdgeAttributesConfig(); 
        } else {
            this.nwRawConfig = undefined; 
            console.error("Invalid config!");
        }
    }

    private setProcessNodeWithUnknownNodeType() { 
        this.processNodeWithUnknownNodeType = this.nwRawConfig && this.nwRawConfig.processNodeWithUnknownNodeType === true? true : false;
    }
        
    private setMandatoryConfig() { 
        if(typeof this.nwRawConfig === 'object' && this.nwRawConfig !== null) {
            this.nwConfig.maxSelectedNodes = toPositiveInteger(this.nwRawConfig.maxSelectedNodes, defaultNwConfig.maxSelectedNodes); 
            this.nwConfig.displayLabel = toBoolean(this.nwRawConfig.displayLabel, defaultNwConfig.displayLabel); 
            this.nwConfig.autoExpand = toBoolean(this.nwRawConfig.autoExpand, defaultNwConfig.autoExpand); 
            this.nwConfig.numHops = toPositiveInteger(this.nwRawConfig.numHops, defaultNwConfig.numHops); 
            this.nwConfig.maxNodeCount = toPositiveInteger(this.nwRawConfig.maxNodeCount, defaultNwConfig.maxNodeCount);
            this.nwConfig.viewportHeight = toPositiveInteger(this.nwRawConfig.viewportHeight, defaultNwConfig.viewportHeight); 
            this.nwConfig.nodeRadius = toPositiveInteger(this.nwRawConfig.nodeRadius, defaultNwConfig.nodeRadius);
        }
    }

    private setNodeConfig() {
        let nodeRawConfig = (this.nwRawConfig && this.nwRawConfig.node? this.nwRawConfig.node: {}) as NwNode;
        this.nwConfig.node = {...defaultNwNodeConfig};

        if(isArrayOfNonEmptyStrings(nodeRawConfig.parentRawPath)) {
            this.nwConfig.node.parentRawPath = nodeRawConfig.parentRawPath;
        } else {
            console.error("Invalid parentRawPath for Nodes");
        }

        if(nodeRawConfig && nodeRawConfig.nodeIdAttribute && isArrayOfNonEmptyStrings(nodeRawConfig.nodeIdAttribute.rawPath)) { 
            this.nwConfig.node.nodeIdAttribute = {...defaultNwAttribute}; 
            if(nodeRawConfig && nodeRawConfig.nodeIdAttribute) {
                this.nwConfig.node.nodeIdAttribute.rawPath = nodeRawConfig.nodeIdAttribute.rawPath; 
                !isStringNullorEmpty(nodeRawConfig.nodeIdAttribute.key)? this.nwConfig.node.nodeIdAttribute.key = nodeRawConfig.nodeIdAttribute.key: null; 
                !isStringNullorEmpty (nodeRawConfig.nodeIdAttribute.displayName)? this.nwConfig.node.nodeIdAttribute.displayName = nodeRawConfig.nodeIdAttribute.displayName : null; 
                typeof nodeRawConfig.nodeIdAttribute.tooltip === 'boolean'? this.nwConfig.node.nodeIdAttribute.tooltip = nodeRawConfig.nodeIdAttribute.tooltip: null;
            } 
        } else {
            console.error("Invalid rawPath in nodeIdAttribute");
        }

        if(nodeRawConfig && nodeRawConfig.nodeTypeAttribute && isArrayOfNonEmptyStrings(nodeRawConfig.nodeTypeAttribute.rawPath)) { 
            this.nwConfig.node.nodeTypeAttribute = {...defaultNwAttribute}; 
            if(nodeRawConfig && nodeRawConfig.nodeTypeAttribute) {
                this.nwConfig.node.nodeTypeAttribute.rawPath = nodeRawConfig.nodeTypeAttribute.rawPath; 
                !isStringNullorEmpty(nodeRawConfig.nodeTypeAttribute.key)? this.nwConfig.node.nodeTypeAttribute.key = nodeRawConfig.nodeTypeAttribute.key: null; 
                !isStringNullorEmpty(nodeRawConfig.nodeTypeAttribute.displayName)? this.nwConfig.node.nodeTypeAttribute.displayName = nodeRawConfig.nodeTypeAttribute.displayName : null; 
                typeof nodeRawConfig.nodeTypeAttribute.tooltip === 'boolean'? this.nwConfig.node.nodeTypeAttribute.tooltip = nodeRawConfig.nodeTypeAttribute.tooltip: null;
            }
        } else {
            console.error("Invalid rawPath in nodeTypeAttribute");
        }

        if(nodeRawConfig && nodeRawConfig.nodeTitleAttribute && isArrayOfNonEmptyStrings(nodeRawConfig.nodeTitleAttribute.rawPath)) { 
            this.nwConfig.node.nodeTitleAttribute = {...defaultNwAttribute}; 
            if(nodeRawConfig && nodeRawConfig.nodeTitleAttribute) {
                this.nwConfig.node.nodeTitleAttribute.rawPath = nodeRawConfig.nodeTitleAttribute.rawPath; 
                !isStringNullorEmpty(nodeRawConfig.nodeTitleAttribute.key)? this.nwConfig.node.nodeTitleAttribute.key = nodeRawConfig.nodeTitleAttribute.key : null; 
                !isStringNullorEmpty(nodeRawConfig.nodeTitleAttribute.displayName)? this.nwConfig.node.nodeTitleAttribute.displayName = nodeRawConfig.nodeTitleAttribute.displayName : null; 
                typeof nodeRawConfig.nodeTitleAttribute.tooltip === 'boolean'? this.nwConfig.node.nodeTitleAttribute.tooltip = nodeRawConfig.nodeTitleAttribute.tooltip : null;
            }
        } else {
            console.error("Invalid rawPath in nodeTitleAttribute");
        }
    }
    
    private setNodeTypesConfig() { 
        let nodeTypesRawConfig = (this.nwRawConfig && this.nwRawConfig.node 
                                    && Array.isArray((this.nwRawConfig.node as NwNode).nodeTypes) ? (this.nwRawConfig.node as NwNode).nodeTypes: []) as NwNodeType[]; 
        for (const nodeTypeFromConfig of nodeTypesRawConfig) {
            let nodeType: NwNodeType; 
            let nodeAttributes = []; 
            let nodeAttributesRawConfig = Array.isArray(nodeTypeFromConfig.nodeAttributes) ? nodeTypeFromConfig.nodeAttributes: []; 
            
            for(const nAttr of nodeAttributesRawConfig) { 
                nodeAttributes.push({
                    key: typeof nAttr.key === 'string'? nAttr.key: EMPTY_STRING, 
                    displayName: typeof nAttr.displayName === 'string'? nAttr.displayName: EMPTY_STRING, 
                    rawPath: Array.isArray(nAttr.rawPath)? nAttr.rawPath: [],
                    tooltip: typeof nAttr.tooltip === 'boolean'? nAttr.tooltip: false 
                    });
            }
            nodeType = {
                name: typeof nodeTypeFromConfig.name === 'string'? nodeTypeFromConfig.name : EMPTY_STRING, 
                displayName: typeof nodeTypeFromConfig.displayName === 'string'? nodeTypeFromConfig.displayName : EMPTY_STRING, 
                color: typeof nodeTypeFromConfig.color === 'string'? nodeTypeFromConfig.color : EMPTY_STRING, 
                imagePath: typeof nodeTypeFromConfig.imagePath === 'string'? nodeTypeFromConfig.imagePath: EMPTY_STRING, 
                nodeAttributes: nodeAttributes
            };
            if(nodeType && typeof nodeType.name === 'string' && nodeType.name.length > 0) {
                this.nwNodeTypes.set(nodeType.name, nodeType);
            }
            if(this.nwConfig && this.nwConfig.node && Array.isArray(this.nwConfig.node.nodeTypes)) { 
                this.nwConfig.node.nodeTypes.push(nodeType);
            }
        }
    }
    
    private setEdgeAttributesConfig() { 
        let edgeAttributesRawConfig = (this.nwRawConfig && this.nwRawConfig.edge && Array.isArray((this.nwRawConfig.edge as NwEdge).edgeAttributes) ? (this.nwRawConfig.edge as NwEdge).edgeAttributes: []) as NwAttribute[]; 
        
        for(const edgeAttributeFromConfig of edgeAttributesRawConfig) { 
            if(this.nwConfig && this.nwConfig.edge && Array.isArray(this.nwConfig.edge.edgeAttributes)) { 
                this.nwConfig.edge.edgeAttributes.push({
                    key: typeof edgeAttributeFromConfig.key === 'string'? edgeAttributeFromConfig.key: EMPTY_STRING, 
                    displayName: typeof edgeAttributeFromConfig.displayName === 'string'? 
                    edgeAttributeFromConfig.displayName : EMPTY_STRING, 
                    rawPath: Array.isArray(edgeAttributeFromConfig.rawPath) ? edgeAttributeFromConfig.rawPath: [], 
                    tooltip: typeof edgeAttributeFromConfig.tooltip === 'string'? edgeAttributeFromConfig.tooltip : false
                });
            }
        }
    }

    private setEdgeConfig() {
        let edgeRawConfig = (this.nwRawConfig && this.nwRawConfig.edge? this.nwRawConfig.edge: {}) as NwEdge;
        this.nwConfig.edge = {...defaultNwEdgeConfig};
        if(this.nwConfig && this.nwConfig.edge && isArrayOfNonEmptyStrings(edgeRawConfig.parentRawPath)) {
            this.nwConfig.edge.parentRawPath = edgeRawConfig.parentRawPath;
        } else {
            console.error("Invalid parentRawPath for Edges");
        }
        if(edgeRawConfig && edgeRawConfig.edgeSourceIdAttribute && isArrayOfNonEmptyStrings(edgeRawConfig.edgeSourceIdAttribute.rawPath)) { 
            this.nwConfig.edge.edgeSourceIdAttribute = {...defaultNwAttribute};
            if(edgeRawConfig && edgeRawConfig.edgeSourceIdAttribute) {
                this.nwConfig.edge.edgeSourceIdAttribute.rawPath = edgeRawConfig.edgeSourceIdAttribute.rawPath; 
                !isStringNullorEmpty(edgeRawConfig.edgeSourceIdAttribute.key)? this.nwConfig.edge.edgeSourceIdAttribute.key = edgeRawConfig.edgeSourceIdAttribute.key : null; 
                !isStringNullorEmpty (edgeRawConfig.edgeSourceIdAttribute.displayName)? this.nwConfig.edge.edgeSourceIdAttribute.displayName = edgeRawConfig.edgeSourceIdAttribute.displayName : null; 
                typeof edgeRawConfig.edgeSourceIdAttribute.tooltip === 'boolean'? this.nwConfig.edge.edgeSourceIdAttribute.tooltip = edgeRawConfig.edgeSourceIdAttribute.tooltip: null;
            }
        } else { 
            console.error("Invalid rawPath in edge SourceIdAttribute");
        }
        if(edgeRawConfig && edgeRawConfig.edgeTargetIdAttribute && isArrayOfNonEmptyStrings(edgeRawConfig.edgeTargetIdAttribute.rawPath)) { 
            this.nwConfig.edge.edgeTargetIdAttribute = {...defaultNwAttribute}; 
            if(edgeRawConfig && edgeRawConfig.edgeTargetIdAttribute) {
                this.nwConfig.edge.edgeTargetIdAttribute.rawPath = edgeRawConfig.edgeTargetIdAttribute.rawPath; 
                !isStringNullorEmpty(edgeRawConfig.edgeTargetIdAttribute.key)? this.nwConfig.edge.edgeTargetIdAttribute.key = edgeRawConfig.edgeTargetIdAttribute.key: null; 
                !isStringNullorEmpty(edgeRawConfig.edgeTargetIdAttribute.displayName)? this.nwConfig.edge.edgeTargetIdAttribute.displayName = edgeRawConfig.edgeTargetIdAttribute.displayName : null; 
                typeof edgeRawConfig.edgeTargetIdAttribute.tooltip === 'boolean'? this.nwConfig.edge.edgeTargetIdAttribute.tooltip = edgeRawConfig.edgeTargetIdAttribute.tooltip: null;
            }
        } else {
            console.error("Invalid rawPath in edge TargetIdAttribute");
        }
        if(edgeRawConfig && edgeRawConfig.edgeTitleAttribute && isArrayOfNonEmptyStrings(edgeRawConfig.edgeTitleAttribute.rawPath)) { 
            this.nwConfig.edge.edgeTitleAttribute = {...defaultNwAttribute}; 
            if(edgeRawConfig && edgeRawConfig.edgeTitleAttribute) {
                this.nwConfig.edge.edgeTitleAttribute.rawPath = edgeRawConfig.edgeTitleAttribute.rawPath; 
                !isStringNullorEmpty(edgeRawConfig.edgeTitleAttribute.key)? this.nwConfig.edge.edgeTitleAttribute.key = edgeRawConfig.edgeTitleAttribute.key: null; 
                !isStringNullorEmpty(edgeRawConfig.edgeTitleAttribute.displayName)? this.nwConfig.edge.edgeTitleAttribute.displayName = edgeRawConfig.edgeTitleAttribute.displayName : null; 
                typeof edgeRawConfig.edgeTitleAttribute.tooltip === 'boolean'? this.nwConfig.edge.edgeTitleAttribute.tooltip = edgeRawConfig.edgeTitleAttribute.tooltip: null;
            }
        } else {
            console.error("Invalid rawPath in edgeTitleAttribute");
        }
    }
}
