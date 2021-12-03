import { JsonProject } from "../json-data";
import { Holder } from "./Holder.class";

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
  
