export default class IEdge {
    index?: number;
    sourceNodeId: string;
    targetNodeId: string;
    constructor(public linkId: any,
                public source: string,
                public target: string,
                public name: string) {
                    this.sourceNodeId = typeof source === 'string'? source: '';
                    this.targetNodeId = typeof target === 'string'? target: '';
                }
}