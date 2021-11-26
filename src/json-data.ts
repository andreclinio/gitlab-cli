
export interface JsonIssue {
    id: number,
    iid: number,
    title: string,
    state: string
}

export interface JsonMilestone {
    id: number,
    iid: number,
    title: string,
    state: string,
}

export interface JsonProject {
    id: number,
    name: string,
    description: string,
    path_with_namespace: string,
    default_branch: string,
    ssh_url_to_repo: string,
    http_url_to_repo: string
}


export interface JsonRelease {
    name: string,
    tag_name: string,
    description: string,
    created_at: string,
    released_at: string,
    milestones: JsonMilestone[]
}