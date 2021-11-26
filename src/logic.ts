import moment from "moment";
import { Moment } from "moment";
import { JsonIssue, JsonMilestone, JsonProject, JsonRelease } from "./json-data";
import { Logger } from "./logger";

class Holder<T> {

    protected data: T;

    constructor(data: T) {
        this.data = data;
    }

}

export class Milestone extends Holder<JsonMilestone> {

    constructor(milestone: JsonMilestone) {
        super(milestone);
    }

    get id(): number {
        return this.data.id;
    }

    get iid(): number {
        return this.data.iid;
    }

    get title(): string {
        return this.data.title;
    }

    get state(): string {
        return this.data.state;
    }

    get stateText(): string {
        const state = this.state;
        const active = state.trim().toLowerCase() === "active";
        const stateStr = active ? Logger.toYellow(state) : state;
        return stateStr;
    }

}


export class Issue extends Holder<JsonIssue> {

    constructor(issue: JsonIssue) {
        super(issue);
    }

    get id(): number {
        return this.data.id;
    }

    get iid(): number {
        return this.data.iid;
    }

    get state(): string {
        return this.data.state;
    }

    get stateText(): string {
        const state = this.state;
        const opened = state.trim().toLowerCase() === "opened";
        const stateStr = opened ? Logger.toRed(state) : state;
        return stateStr;
    }

    get title(): string {
        return this.data.title;
    }

}


export class Release extends Holder<JsonRelease> {

    constructor(release: JsonRelease) {
        super(release);
    }

    get name(): string {
        return this.data.name;
    }

    get created_at(): Moment {
        return moment(this.data.created_at);
    }

    get released_at(): Moment {
        return moment(this.data.released_at);
    }

    get description(): string {
        return this.data.description ? this.data.description : "(no description)";
    }

    get tag_name(): string {
        return this.data.tag_name;
    }

    get milestones(): Milestone[] {
        const ms = this.data.milestones;
        const milestones = ms.map( m => new Milestone(m));
        return milestones;
    }

}


export class Project extends Holder<JsonProject> {
 
    constructor(project: JsonProject) {
        super(project);
    }

    get id(): number {
        return this.data.id;
    }

    get name(): string {
        return this.data.name;
    }

    get description(): string {
        return this.data.description ? this.data.description : "(no description)";
    }

    get path_with_namespace(): string {
        return this.data.path_with_namespace;
    }

    get default_branch(): string {
        return this.data.default_branch;
    }

    get http_url_to_repo(): string {
        return this.data.http_url_to_repo;
    }

    get ssh_url_to_repo(): string {
        return this.data.ssh_url_to_repo;
    }
}