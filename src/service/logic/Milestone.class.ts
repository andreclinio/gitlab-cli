import { JsonMilestone } from "../json-data";
import { Logger } from "../../logger";
import { Holder } from "./Holder.class";

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
    if (this.active) return Logger.toYellow(state);
    else if (this.closed) return Logger.toGreen(state);
    return state;
  }
}