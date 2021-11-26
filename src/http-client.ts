import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { from, map, Observable } from 'rxjs';

import { Logger } from './logger';
import { JsonIssue, JsonMilestone, JsonProject, JsonRelease } from './json-data';
import { Issue, Milestone, Project, Release } from './logic';

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
        const jsonIssues$ = from(this.mountGetRequest<JsonIssue[]>(path)).pipe( map( (ax) => ax.data));
        const issues$ = jsonIssues$.pipe(map((jis) => jis.map( ji => new Issue(ji))));
        const opened$ = issues$.pipe(map((issues) => issues.filter(i => i.state == "opened")));
        return opened$;
    }

    public getMilestoneIssues(projectId: number, milestoneId: number): Observable<Issue[]> {
        const path = `/projects/${projectId}/milestones/${milestoneId}/issues`;
        const jsonIssues$ = from(this.mountGetRequest<JsonIssue[]>(path)).pipe( map( (ax) => ax.data));
        const issues$ = jsonIssues$.pipe(map((jis) => jis.map( ji => new Issue(ji))));
        return issues$;
    }

    public getMilestones(projectId: number, onlyActive: boolean): Observable<Milestone[]> {
        const path = `/projects/${projectId}/milestones?per_page=100`;
        const jsonMilestones$ = from(this.mountGetRequest<JsonMilestone[]>(path)).pipe( map( (ax) => ax.data));
        const milestones$ = jsonMilestones$.pipe(map((jms) => jms.map( jm => new Milestone(jm))));
        const results$ = onlyActive ? milestones$.pipe(map(m => m.filter(m => m.state === 'active'))) : milestones$;
        return results$.pipe(map(ms => ms.sort((m1, m2) => m2.id - m1.id)));
    }

    public getReleases(projectId: number): Observable<Release[]> {
        const path = `/projects/${projectId}/releases?per_page=100`;
        const jsonReleases$ = from(this.mountGetRequest<JsonRelease[]>(path)).pipe( map( (ax) => ax.data));
        const releases$ = jsonReleases$.pipe(map((jrs) => jrs.map( (jr) => new Release(jr))));
        const ordered$ = releases$.pipe(map(rs => rs.sort((r1, r2) => r1.released_at.isBefore(r2.released_at) ? 1 : 1)));
        return ordered$;
    }

    public getProjects(): Observable<Project[]> {
        const path = `/projects?per_page=100&order_by=name&sort=asc&membership=true`;
        const jsonProjects$ = from(this.mountGetRequest<JsonProject[]>(path)).pipe( map( (ax) => ax.data));
        const projects$ = jsonProjects$.pipe(map((jps) => jps.map( (jp) => new Project(jp))));
        return projects$;
    }

}