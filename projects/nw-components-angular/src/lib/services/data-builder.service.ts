import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Injectable } from "@angular/core";
import { EdgeId, IEdge, INode, INwData, NeighboursStateType, NodeId } from "../models/nw-data";
import { ConfigParserService } from "./config-parser.service";
import {get as lodashGet } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { NwAttribute } from '../models/nw-config';
import { EMPTY_STRING, isArrayOfNonEmptyStrings, isStringNullorEmpty } from "../utils";

@Injectable()
export class DataBuilderService {
    public nwData: INwData = {
        nodes: new Map<NodeId, INode>(),
        edges: new Map<EdgeId, IEdge>()
    };

    constructor(private nwConfigParser: ConfigParserService) {}

    public getNetworkData(rawData: any) {
        if(
            this.nwConfigParser && 
            this.nwConfigParser.nwConfig && 
            this.nwConfigParser.nwConfig.node && 
            this.nwConfigParser.nwConfig.edge
        ) {
            const nodeCollection = lodashGet(rawData, this.nwConfigParser.nwConfig.node.parentRawPath, null); 
            const edgeCollection = lodashGet(rawData, this.nwConfigParser.nwConfig.edge.parentRawPath, null); 
            // Node 
            if(Array.isArray(nodeCollection)) { 
                for (const rawNode of nodeCollection) {
                    const newNode = {} as INode; 
                    this.loadNwNodeAttributesFromRawNode(rawNode, newNode); 
                    this.sanitizeNwNode(newNode, this.nwConfigParser.nwConfig.nodeRadius); 
                    if(this.isNwNodeValid(newNode) && this.shouldAddNodeWithUnknownNodeType(newNode)) {
                        this.nwData.nodes.set(newNode.id, newNode);
                    }
                }
            }
            // Edge 
            if(Array.isArray(edgeCollection)) { 
                for(const rawEdge of edgeCollection) {
                    const newEdge = {} as IEdge; 
                    this.loadNwEdgeAttributesFromRawNode(rawEdge, newEdge); 
                    this.sanitizeNwEdge(newEdge); 
                    if (this.isNwEdgeValid(newEdge, this.nwData.nodes)) {
                        this.nwData.edges.set(newEdge.id, newEdge);
                    }
                }
            }
        }
        this.SanitizeNwData(this.nwData); 
        return this.nwData;
    }

    private loadNwEdgeAttributesFromRawNode(rawEdge: any, nwEdge: IEdge) {
        let edgeSourceRawPath: string[] | undefined = []; 
        let edgeTargetRawPath: string[] | undefined = []; 
        let edgeTitleRawPath: string[] | undefined= []; 
        let eAttrs: NwAttribute[] = []; 
        if(this.nwConfigParser && this.nwConfigParser.nwConfig && this.nwConfigParser.nwConfig.edge) { 
            edgeSourceRawPath = (this.nwConfigParser.nwConfig.edge.edgeSourceIdAttribute 
                                    && this.nwConfigParser.nwConfig.edge.edgeSourceIdAttribute.rawPath)? 
                                    this.nwConfigParser.nwConfig.edge.edgeSourceIdAttribute.rawPath : undefined;
            edgeTargetRawPath = (this.nwConfigParser.nwConfig.edge.edgeTargetIdAttribute 
                                    && this.nwConfigParser.nwConfig.edge.edgeTargetIdAttribute.rawPath)?
                                    this.nwConfigParser.nwConfig.edge.edgeTargetIdAttribute.rawPath: undefined; 
            edgeTitleRawPath = (this.nwConfigParser.nwConfig.edge.edgeTitleAttribute 
                                    && this.nwConfigParser.nwConfig.edge.edgeTitleAttribute.rawPath)?
                                    this.nwConfigParser.nwConfig.edge.edgeTitleAttribute.rawPath: undefined; 
            eAttrs = this.nwConfigParser.nwConfig.edge.edgeAttributes;
        }
        if(Array.isArray(eAttrs)) { 
            for (const eAttr of eAttrs) { 
                if(eAttr && eAttr.key && !isStringNullorEmpty(eAttr.key)) {
                    nwEdge[eAttr.key] = lodashGet(rawEdge, eAttr.rawPath as string[], null);
                }
            }
        }
        // Set Edge Source ID 
        if(isArrayOfNonEmptyStrings(edgeSourceRawPath)) {
            nwEdge.source = lodashGet(rawEdge, edgeSourceRawPath as string[], EMPTY_STRING);
        }
        // Set Edge target Type 
        if(isArrayOfNonEmptyStrings(edgeTargetRawPath)) {
            nwEdge.target = lodashGet(rawEdge, edgeTargetRawPath as string[], EMPTY_STRING);
        }
        // Set Edge Title 
        if(isArrayOfNonEmptyStrings(edgeTitleRawPath)) {
            nwEdge.title = lodashGet(rawEdge, edgeTitleRawPath as string[], EMPTY_STRING);
        }
    }

    private loadNwNodeAttributesFromRawNode(rawNode: any, nwNode: INode) {
        let nodeIdRawPath: string[] | undefined; 
        let nodeTypeRawPath: string[] | undefined; 
        let nodeTitleRawPath: string[] | undefined;
        
        if(this.nwConfigParser && this.nwConfigParser.nwConfig && this.nwConfigParser.nwConfig.node) { 
            nodeIdRawPath = this.nwConfigParser.nwConfig.node.nodeIdAttribute ?
                                this.nwConfigParser.nwConfig.node.nodeIdAttribute.rawPath: undefined; 
            nodeTypeRawPath = this.nwConfigParser.nwConfig.node.nodeTypeAttribute ?
                                this.nwConfigParser.nwConfig.node.nodeTypeAttribute.rawPath: undefined; 
            nodeTitleRawPath = this.nwConfigParser.nwConfig.node.nodeTitleAttribute ?
                                this.nwConfigParser.nwConfig.node.nodeTitleAttribute.rawPath: undefined;
        }
        const nodeType = lodashGet(rawNode, nodeTypeRawPath as string[], EMPTY_STRING); 
        const nodeTypeConfig = this.nwConfigParser.nwNodeTypes.get(nodeType);

        const nAttrs = nodeTypeConfig && nodeTypeConfig.nodeAttributes? nodeTypeConfig.nodeAttributes : undefined; 
        nwNode.nodeDescAttributes = []; 
        nwNode.nodeRawObject = {}; 
        if(Array.isArray(nAttrs)) { 
            for(const nAttr of nAttrs) { 
                if (nAttr && nAttr.key && !isStringNullorEmpty(nAttr.key) && isArrayOfNonEmptyStrings(nAttr.rawPath)) {
                    nwNode[nAttr.key] = lodashGet(rawNode, nAttr.rawPath as string[], EMPTY_STRING); 
                    nwNode.nodeRawObject[nAttr.key] = typeof nwNode[nAttr.key] === 'string'
                                                        || typeof nwNode[nAttr.key] === 'number' 
                                                        || typeof nwNode[nAttr.key] === 'boolean'? nwNode[nAttr.key]:
                                                            EMPTY_STRING; 
                    if(nAttr.tooltip === true) { 
                        nwNode.nodeDescAttributes.push({
                            attribute: nAttr.key, 
                            title: typeof nAttr.displayName === 'string'? nAttr.displayName : EMPTY_STRING
                        });
                    }
                }
            }
        }
        // Set Node ID 
        if(isArrayOfNonEmptyStrings(nodeIdRawPath)) {
            nwNode.id = lodashGet(rawNode, nodeIdRawPath as string[], EMPTY_STRING);
        }
        // Set Node Type 
        if(isArrayOfNonEmptyStrings(nodeTypeRawPath)) {
            nwNode.type = lodashGet(rawNode, nodeTypeRawPath as string[], EMPTY_STRING);
        }
        // Set Node Title 
        if(isArrayOfNonEmptyStrings(nodeTitleRawPath)) {
            nwNode.label = lodashGet(rawNode, nodeTitleRawPath as string[], EMPTY_STRING);
        }
        // Set Node type name 
        nwNode.title = nodeType; 
        // Set color 
        nwNode.color = nodeTypeConfig && typeof nodeTypeConfig.color === 'string'? nodeTypeConfig.color : EMPTY_STRING; 
        // Set ImagePath 
        nwNode.imagePath = nodeTypeConfig && typeof nodeTypeConfig.imagePath === 'string'? nodeTypeConfig.imagePath: EMPTY_STRING;
    }

    private sanitizeNwNode(nwNode: INode, nodeRadius: number) { 
        if(typeof nwNode === 'object') {
            nwNode.id = nwNode && (typeof nwNode.id === 'string' || typeof nwNode.id === 'number') ? 
                        nwNode.id.toString(): EMPTY_STRING; 
            nwNode.type = nwNode && (typeof nwNode.type === 'string' || typeof nwNode.type === 'number') ? 
                        nwNode.type.toString(): EMPTY_STRING; 
            nwNode.r = nodeRadius;
            nwNode.sourceIds = []; 
            nwNode.targetIds = []; 
            nwNode.neighboursStatus = NeighboursStateType.LOADED; 
            // Hack for now 
            nwNode.nodeId = nwNode.id!; 
            nwNode.nodeType = nwNode.type!;
            nwNode.collapsed = true;
        }
    }
    private sanitizeNwEdge(nwEdge: IEdge) { 
        if (typeof nwEdge === 'object') {
            nwEdge.source = typeof nwEdge.source === 'string' || typeof nwEdge.source === 'number' ? 
                nwEdge.source.toString() : EMPTY_STRING; 
            nwEdge.target = typeof nwEdge.target === 'string' || typeof nwEdge.target === 'number' ? 
                nwEdge.target.toString() : EMPTY_STRING; 
            nwEdge.title = typeof nwEdge.title === 'string' || typeof nwEdge.title === 'number' ? 
                nwEdge.title.toString() : EMPTY_STRING; 
            nwEdge.id = typeof nwEdge.id === 'string' || typeof nwEdge.id === 'number' ? 
                nwEdge.id.toString() : uuidv4(); 
            nwEdge.name = nwEdge.title!; 
            nwEdge.linkId = nwEdge.id; 
            nwEdge.sourceNodeId = nwEdge.source; 
            nwEdge.targetNodeId = nwEdge.target;
        }
    }
    private isNwNodeValid(nwNode: INode): boolean {
        let idValid = false;
        let typeValid = false;
        if(nwNode) {
            // Validating Node ID
            if(typeof nwNode.id === 'string' && nwNode.id.trim().length > 0) {
                idValid = true;
            }
            // Validating Node Type
            if(typeof nwNode.type === 'string' && nwNode.type.trim().length > 0) {
                typeValid = true;
            }
            return idValid && typeValid;        
        } else {
            return false;
        }
    }

    private shouldAddNodeWithUnknownNodeType(nwNode: INode): boolean {
        if(this.nwConfigParser) {
            const processNodeWithUnknownNodeType = this.nwConfigParser.processNodeWithUnknownNodeType;
            if(processNodeWithUnknownNodeType === true) {
                return true;
            } else {
                if(this.nwConfigParser.nwNodeTypes.has(nwNode.nodeType)) {
                    return true;
                }
                return false;
            }
        } 
        return false;
    }

    private isNwEdgeValid(nwEdge: IEdge, nodeCollection: Map<NodeId, INode>) {
        let sourceValid = false;
        let targetValid = false;
        if(nwEdge) {
            // Validating Source Node ID
            if(nodeCollection.has(nwEdge.source)) {
                sourceValid = true;
            }
            // Validating Target Node Type 
            if(nodeCollection.has(nwEdge.target)) {
                targetValid = true;
            }
            return sourceValid && targetValid; 
        } else { 
            return false;
        }
    }
    SanitizeNwData(nwData: INwData) {
        const invalidEdgeIds: string[] = []; 
        nwData.edges.forEach(edge => { 
            if(isStringNullorEmpty(edge.source) || isStringNullorEmpty(edge.target)) {
                invalidEdgeIds.push(edge.id); 
            } else { 
                if(nwData.nodes.has(edge.source) && nwData.nodes.has(edge.target)) {
                    const sourceNode = nwData.nodes.get(edge.source); 
                    const targetNode = nwData.nodes.get(edge.target); 
                    if(sourceNode && targetNode && Array.isArray(sourceNode.targetIds) 
                            && Array.isArray(targetNode.sourceIds)) {
                                sourceNode.targetIds.indexOf(edge.target) === -1? sourceNode.targetIds.push(edge.target) : null;
                                targetNode.sourceIds.indexOf(edge.source) === -1? targetNode.sourceIds.push(edge.source) : null; 
                    } else {
                        invalidEdgeIds.push(edge.id);
                    }
                } else {
                    invalidEdgeIds.push(edge.id);
                }
            }
        }); 
        invalidEdgeIds.forEach(id => { 
            if(nwData.edges.has(id)) {
                nwData.edges.delete(id);
            }
        });
    }
}
