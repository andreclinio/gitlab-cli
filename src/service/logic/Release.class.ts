import moment from "moment";
import { Moment } from "moment";
import { Logger } from "../../logger";
import { JsonRelease } from "../json-data";
import { Holder } from "./Holder.class";
import { Milestone } from "./Milestone.class";
import { ReleaseAsset } from "./ReleaseAssets.class";

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
    const ms = this.data.milestones || [];
    const milestones = ms.map((m) => new Milestone(m));
    return milestones;
  }

  get assets(): ReleaseAsset {
    const as = this.data.assets;
    const assets = new ReleaseAsset(as);
    return assets;
  }

  toString() : string {
    return `[release ${this.name}] (${Logger.dthr(this.released_at)})`;
  }
}