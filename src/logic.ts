import moment from "moment";
import { Moment } from "moment";
import { JsonCommit, JsonIssue, JsonMilestone, JsonPipeline, JsonProject, JsonRelease, JsonTag } from "./json-data";
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

    get active(): boolean {
        return this.state.trim().toLowerCase() === "active";
    }

    get closed(): boolean {
        return this.state.trim().toLowerCase() === "closed";
    }

    get stateText(): string {
        const state = this.state;
        if (this.active) return Logger.toYellow(state)
        else if (this.closed) return Logger.toGreen(state);
        return state;
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

    get opened() : boolean {
        return this.state.toLowerCase() == "opened";
    }

    get closed() : boolean {
        return this.state.toLowerCase() == "closed";
    }

    get stateText(): string {
        const stateStr = this.opened ? Logger.toRed(this.state) : Logger.toGreen(this.state);
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


export class Tag extends Holder<JsonTag> {
 
    constructor(tag: JsonTag) {
        super(tag);
    }

    get name(): string {
        return this.data.name;
    }

    get message(): string {
        return this.data.message;
    }

    get commit(): Commit {
        const c = this.data.commit;
        const commit = new Commit(c);
        return commit;
    }
}


export class Pipeline extends Holder<JsonPipeline> {
 
    constructor(pipeline: JsonPipeline) {
        super(pipeline);
    }

    get id(): number {
        return this.data.id;
    }

    get ref(): string {
        return this.data.ref;
    }

    get status(): string {
        return this.data.status;
    }

    get sha(): string {
        return this.data.sha;
    }

    get sha_resumed(): string {
        const n = 5;
        const len = this.sha.length;
        return this.sha.substring(0, 5) + "..." + this.sha.substring(len - 5, len);
    }

    get success() : boolean {
        return this.status == "success";
    }

    get canceled() : boolean {
        return this.status == "canceled";
    }

    get failed() : boolean {
        return this.status == "failed";
    }

    get running() : boolean {
        return this.status == "running";
    }

    get paused() : boolean {
        return this.status == "paused";
    }

    get web_url() : string {
        return this.data.web_url;
    }

    get created_at(): Moment {
        return moment(this.data.created_at);
    }

    get updated_at(): Moment {
        return moment(this.data.updated_at);
    }

    get statusText(): string {
        const status = this.status;
        if (this.failed) return Logger.toRed(status);
        else if (this.canceled) return Logger.toYellow(status);
        else if (this.paused) return Logger.toYellow(status);
        else if (this.success) return Logger.toGreen(status);
        else if (this.running) return Logger.toCyan(status);
        else return status;
    }

}