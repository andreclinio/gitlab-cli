import { JsonMergeRequest, JsonUser } from '../json-data';
import { Logger } from '../../logger';
import { Holder } from './Holder.class';
import { Moment } from 'moment';
import moment from 'moment';

export class MergeRequest extends Holder<JsonMergeRequest> {
    constructor(mergeRequest: JsonMergeRequest) {
        super(mergeRequest);
    }

    get id(): number {
        return this.data.id;
    }

    get iid(): number {
        return this.data.iid;
    }

    get title(): string {
        return this.data.title || '(no title)';
    }

    get description(): string {
        return this.data.description || '(no description)';
    }

    get author(): JsonUser {
        return this.data.author || {};
    }

    get state(): string {
        return this.data.state || '';
    }

    get opened(): boolean {
        return this.state.trim().toLowerCase() === 'opened';
    }

    get closed(): boolean {
        return this.state.trim().toLowerCase() === 'closed';
    }

    get merged(): boolean {
        return this.state.trim().toLowerCase() === 'merged';
    }

    get created_at(): Moment {
        return moment(this.data.created_at);
    }

    get updated_at(): Moment {
        return moment(this.data.updated_at);
    }

    get closed_at(): Moment {
        return moment(this.data.closed_at);
    }

    get merged_at(): Moment {
        return moment(this.data.merged_at);
    }

    get source_branch(): string {
        return this.data.source_branch;
    }

    get target_branch(): string {
        return this.data.target_branch;
    }

    get stateText(): string {
        const state = this.state;
        if (this.opened) return Logger.toYellow(state);
        else if (this.closed || this.merged) return Logger.toGreen(state);
        return state;
    }

    get directionsText(): string {
        return `${this.source_branch} --> ${this.target_branch}`;
    }

    toString(): string {
        const id = `MergeRequest #${this.id} :: ${this.author.username}`;
        return `[${id}] ${this.title} - (${this.directionsText}) - [${this.stateText}]`;
    }
}
