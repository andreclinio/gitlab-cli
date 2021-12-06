import { JsonIssue } from "../json-data";
import { Logger } from "../../logger";
import { Holder } from "./Holder.class";
import { Moment } from "moment";
import moment from "moment";

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

  get title(): string {
    return this.data.title;
  }

  toString(): string {
    return `[issue #${this.iid}] ${this.title} [${this.stateText}] [${this.timeText}]`;
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

  get timeText(): string {
    if (this.closed) return Logger.toGreen("closed");
    const daysToEndTxt = Math.abs(this.daysToEnd) > 30 ? ">30" : this.daysToEnd.toFixed(0);
    if (this.late) return Logger.toRed(`late (${daysToEndTxt}d)`);
    return Logger.toYellow(`in time (${daysToEndTxt}d)`);
  }

}
