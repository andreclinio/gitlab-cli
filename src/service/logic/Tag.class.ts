import { JsonTag } from "../json-data";
import { Commit } from "./Commit.class";
import { Holder } from "./Holder.class";

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
  
  
  