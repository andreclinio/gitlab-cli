import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { from, map, Observable } from 'rxjs';
import { Logger } from './logger';

export interface Issue {
    id: number,
    iid: number,
    title: string,
    state: string
}

export interface Project {
    id: number,
    name: string,
    path_with_namespace: string,
    default_branch: string,
    ssh_url_to_repo: string,
    http_url_to_repo: string
}

export interface Milestone {
    id: number,
    iid: number,
    title: string,
    state: string,
}

export class HttpClient {

    private readonly instance: AxiosInstance;
    private readonly token: string;
    private readonly logger: Logger;

    public constructor(logger: Logger, baseURL: string, token: string) {
        this.logger = logger;
        this.token = token;
        this.instance = axios.create({
            baseURL
        });
    }

    private mountUrl(path: string): string {
        const url = `/api/v4/${path}`;
        return url;
    }

    private mountGetRequest<T>(path: string): Promise<AxiosResponse<T, any>> {
        const auth = `Bearer ${this.token}`;
        const pth = this.mountUrl(path);
        this.logger.log(`URL: ${pth}`);
        return this.instance.get<T>(pth, { 'headers': { 'Authorization': auth } });
    }

    public getOpenedIssues(projectId: number): Observable<Issue[]> {
        const path = `/projects/${projectId}/issues`;
        const data$ = from(this.mountGetRequest<Issue[]>(path));
        const opened$ = data$.pipe(map((issues) => issues.data.filter( i => i.state == "opened")));
        return opened$;
    }

    public getMilestoneIssues(projectId: number, milestoneId: number): Observable<Issue[]> {
        const path = `/projects/${projectId}/milestones/${milestoneId}/issues`;
        const data$ = from(this.mountGetRequest<Issue[]>(path));
        const issues$ = data$.pipe(map((issues) => issues.data));
        return issues$;
    }

    public getMilestones(projectId: number, onlyActive: boolean): Observable<Milestone[]> {
        const path = `/projects/${projectId}/milestones?per_page=100`;
        const data$ = from(this.mountGetRequest<Milestone[]>(path));
        const all$ = data$.pipe(map((issues) => issues.data));
        const milestones$ = onlyActive ? all$.pipe( map(ms => ms.filter( m => m.state === 'active'))) : all$;
        return milestones$.pipe(map(ms => ms.sort( (m1, m2) => m2.id - m1.id)));
    }

    public getProjects(): Observable<Project[]> {
        const path = `/projects?per_page=100&order_by=name&sort=asc&membership=true`;
        const data$ = from(this.mountGetRequest<Project[]>(path));
        const projects$ = data$.pipe(map((res) => res.data));
        return projects$;
    }

}