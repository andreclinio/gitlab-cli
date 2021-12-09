import { JsonIssue } from "../json-data";
import { Logger } from "../../logger";
import { Holder } from "./Holder.class";
import { Moment } from "moment";
import moment from "moment";
import { IssueAssignee } from "./IssueAssignee.class";
import { Milestone } from "./Milestone.class";

export enum IssueState {
  OPENED = "opened",
  CLOSED = "closed"
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

  get web_url(): string {
    return this.data.web_url;
  }

  get assignees(): IssueAssignee[] {
    const as = this.data.assignees;
    const assignees = as.map((a) => new IssueAssignee(a));
    return assignees;
  }

  get milestone(): Milestone | undefined {
    const m = this.data.milestone;
    if (!m) return undefined;
    return new Milestone(m);
  }

  get unassigned(): boolean {
    return !this.assignees || this.assignees.length === 0;
  }

  get labels(): string[] {
    return this.data.labels;
  }

  get opened(): boolean {
    return this.state === IssueState.OPENED;
  }

  get closed(): boolean {
    return this.state === IssueState.CLOSED;
  }

  get due_date(): Moment {
    if (this.data.due_date) return moment(this.data.due_date);
    return moment().add(1, 'years');
  }

  get closed_at(): Moment {
    if (this.data.closed_at) return moment(this.data.closed_at);
    return moment().add('1970-01-01');
  }

  get title(): string {
    return this.data.title;
  }

  toString(detailed: boolean): string {
    let txt = `[issue #${this.iid}] ${this.title} [${this.stateText}]`;
    if (detailed) {
      const assTxt = this.unassigned ? `[${Logger.toYellow("assigned to nobody")}]` : this.assignees.map(as => as.toString()).join(',');
      txt += `\n[Assigned to: ${assTxt}] `;
      txt += this.milestone ? `[Milestone: ${this.milestone.title} (${this.milestone.stateText})]` : `[${Logger.toYellow('No milestone')}]`;
      txt += `\n[${this.timeText}] [${this.labelsText}]`;
      txt += `\n[${Logger.toCyan(this.web_url)}]`;
      txt += "\n";
    }
    return txt;
  }

  get late(): boolean {
    if (this.closed) return false;
    return this.due_date.isBefore(moment());
  }

  get daysToEnd(): number {
    const now = moment();
    const d = moment.duration(this.due_date.diff(now));
    return d.asDays();
  }

  get stateText(): string {
    const state = this.state;
    if (this.closed) return Logger.toGreen(state);
    return Logger.toRed(state)
  }

  get labelsText(): string {
    const labels = this.labels;
    if (!labels || labels.length === 0) return "";
    return labels.map(l => Logger.toMagenta(l)).join(', ');
  }

  get timeText(): string {
    if (this.closed) return Logger.toGreen(`closed at ${this.dayOf(this.closed_at)}`);
    const daysToEndTxt = Math.abs(this.daysToEnd) > 30 ? ">30" : this.daysToEnd.toFixed(0);
    if (this.late) return Logger.toRed(`late (${daysToEndTxt}d)`);
    return Logger.toYellow(`in time (${daysToEndTxt}d)`);
  }

}
