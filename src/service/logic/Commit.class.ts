import moment from 'moment';
import { Moment } from 'moment';
import { JsonCommit } from '../json-data';
import { Holder } from './Holder.class';

export class Commit extends Holder<JsonCommit> {
    constructor(commit: JsonCommit) {
        super(commit);
    }

    get id(): string {
        return this.data.id;
    }

    get author_name(): string {
        return this.data.author_name;
    }

    get commited_at(): Moment {
        return moment(this.data.committed_date);
    }
}
