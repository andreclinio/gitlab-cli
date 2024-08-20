import { Logger } from '../../logger';
import { JsonTag } from '../json-data';
import { Commit } from './Commit.class';
import { Holder } from './Holder.class';

export class Tag extends Holder<JsonTag> {
    constructor(tag: JsonTag) {
        super(tag);
    }

    get name(): string {
        return this.data.name;
    }

    get message(): string {
        return this.data.message || '(no message)';
    }

    get commit(): Commit {
        const c = this.data.commit;
        const commit = new Commit(c);
        return commit;
    }

    toString(): string {
        return `[tag ${this.name}] ${this.message} :: ${Logger.dthr(this.commit.commited_at)}`;
    }
}
