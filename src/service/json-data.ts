export interface JsonIssue {
  id: number;
  iid: number;
  title: string;
  state: string;
  due_date: string;
  closed_at: string;
  labels: string[];
  assignees: JsonIssueAssignee[];
  web_url: string;
  milestone: JsonMilestone;
}

export interface JsonIssueAssignee {
  id: number;
  name: string;
  username: string;
}

export interface JsonMilestone {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: string;
  start_date: string;
  due_date: string;
}

export interface JsonLabel {
  id: number;
  name: string;
  description: string;
  priority: number;
  is_project_label: boolean;
}

export interface JsonProject {
  id: number;
  name: string;
  description: string;
  path: string;
  path_with_namespace: string;
  default_branch: string;
  ssh_url_to_repo: string;
  http_url_to_repo: string;
}

export interface JsonPipeline {
  id: number;
  project_id: number;
  ref: string;
  status: string;
  sha: string;
  created_at: string;
  updated_at: string;
  web_url: string;
}

export interface JsonRelease {
  name: string;
  tag_name: string;
  description: string;
  created_at: string;
  released_at: string;
  milestones: JsonMilestone[];
  assets: JsonReleaseAssets;
}

export interface JsonReleaseAssetLink {
  id: number;
  name: string;
  url: string;
  external: boolean;
  link_type: string;
}

export interface JsonReleaseAssets {
  links: JsonReleaseAssetLink[];
}


export interface JsonCommit {
  id: string;
  short_id: string;
  committed_date: string;
  author_name: string;
}

export interface JsonTag {
  name: string;
  message: string;
  target: string;
  commit: JsonCommit;
}

