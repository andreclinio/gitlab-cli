import { JsonMilestone } from "../json-data";
import { Logger } from "../../logger";
import { Holder } from "./Holder.class";
import { Moment } from "moment";
import moment from "moment";

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
    return this.data.title || "(no title)";
  }

  get description(): string {
    return this.data.description || "(no description)";
  }

  get state(): string {
    return this.data.state || "";
  }

  get active(): boolean {
    return this.state.trim().toLowerCase() === "active";
  }

  get closed(): boolean {
    return this.state.trim().toLowerCase() === "closed";
  }

  get start_date(): Moment {
    return moment(this.data.start_date);
  }

  get due_date(): Moment {
    if (this.data.due_date) return moment(this.data.due_date);
    return moment().add(1, 'years');
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
    if (this.active) return Logger.toYellow(state);
    else if (this.closed) return Logger.toGreen(state);
    return state;
  }

  get timeText(): string {
    if (this.closed) return Logger.toGreen("closed");
    const daysToEndTxt = Math.abs(this.daysToEnd) > 30 ? "more than 30" : this.daysToEnd;
    if (this.late) return Logger.toRed("late") + ` (${daysToEndTxt} days late)`;
    return Logger.toYellow("in time") + ` (${daysToEndTxt} days remaining)`;
  }

  toString() : string {
    return `[milestone #${this.id}] ${this.title} - [${this.stateText}] [${this.timeText}]`;
  }
}