import { JsonLabel } from '../json-data';
import { Holder } from './Holder.class';

export class Label extends Holder<JsonLabel> {
    constructor(label: JsonLabel) {
        super(label);
    }

    get id(): number {
        return this.data.id;
    }

    get name(): string {
        return this.data.name || '(no title)';
    }

    get description(): string {
        return this.data.description || '(no description)';
    }

    get isProject(): boolean {
        return this.data.is_project_label;
    }

    get priority(): number {
        return this.data.priority;
    }

    toString(): string {
        const priorityText = this.priority === null ? '' : `(${this.priority})`;
        return `[label #${this.id}] ${this.name} ${priorityText}`;
    }
}
