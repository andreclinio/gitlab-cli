import moment from "moment";
import { Moment } from "moment";
import { JsonRelease } from "../json-data";
import { Holder } from "./Holder.class";
import { Milestone } from "./MIlestone.class";

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
      const milestones = ms.map((m) => new Milestone(m));
      return milestones;
    }
  }