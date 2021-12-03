import moment from "moment";
import { Moment } from "moment";
import { JsonPipeline } from "../json-data";
import { Logger } from "../../logger";
import { Holder } from "./Holder.class";

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
  
    get success(): boolean {
      return this.status === "success";
    }
  
    get canceled(): boolean {
      return this.status === "canceled";
    }
  
    get failed(): boolean {
      return this.status === "failed";
    }
  
    get running(): boolean {
      return this.status === "running";
    }
  
    get paused(): boolean {
      return this.status === "paused";
    }
  
    get web_url(): string {
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