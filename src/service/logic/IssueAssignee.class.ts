import { JsonUser } from '../json-data';
import { Holder } from './Holder.class';

export class IssueAssignee extends Holder<JsonUser> {
    constructor(assignee: JsonUser) {
        super(assignee);
    }

    get name(): string {
        return this.data.name;
    }

    get username(): string {
        return this.data.username;
    }

    public toString(): string {
        return `${this.name} (${this.username})`;
    }
}
