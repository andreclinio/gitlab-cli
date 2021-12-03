import { JsonIssue } from "../json-data";
import { Logger } from "../../logger";
import { Holder } from "./Holder.class";

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
      return this.state.toLowerCase() === "opened";
    }
  
    get closed(): boolean {
      return this.state.toLowerCase() === "closed";
    }
  
    get stateText(): string {
      const stateStr = this.opened
        ? Logger.toRed(this.state)
        : Logger.toGreen(this.state);
      return stateStr;
    }
  
    get title(): string {
      return this.data.title;
    }
  }
  