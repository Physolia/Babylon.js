import type { FlowGraphBlock } from "./flowGraphBlock";
import { FlowGraphConnection, FlowGraphConnectionType } from "./flowGraphConnection";
import type { FlowGraphContext } from "./flowGraphContext";
import type { RichType } from "./flowGraphRichTypes";
import { FlowGraphValueWithRichType } from "./flowGraphValueWithRichType";

/**
 * @experimental
 * Represents a connection point for data.
 * An unconnected input point can have a default value.
 * An output point will only have a value if it is connected to an input point. Furthermore,
 * if the point belongs to a "function" node, the node will run its function to update the value.
 */
export class FlowGraphDataConnection<T> extends FlowGraphConnection<FlowGraphBlock, FlowGraphDataConnection<T>> {
    private richValue: FlowGraphValueWithRichType<T, RichType<T>>;

    public constructor(name: string, connectionType: FlowGraphConnectionType, ownerBlock: FlowGraphBlock, public richType: RichType<T>) {
        super(name, connectionType, ownerBlock);
        this.richValue = new FlowGraphValueWithRichType(richType);
    }

    /**
     * An output data block can connect to multiple input data blocks,
     * but an input data block can only connect to one output data block.
     */
    public _isSingularConnection(): boolean {
        return this.connectionType === FlowGraphConnectionType.Input;
    }

    public set value(value: T) {
        this.richValue.value = value;
    }

    public getValue(context: FlowGraphContext): T {
        if (this.connectionType === FlowGraphConnectionType.Output) {
            this._ownerBlock._updateOutputs(context);
            return this.richValue.value;
        }

        if (!this.isConnected()) {
            return this.richValue.value;
        } else {
            return this._connectedPoint[0].getValue(context);
        }
    }
}
