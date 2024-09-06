import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
    forkJoin,
    from,
    map,
    mergeAll,
    mergeMap,
    Observable,
    of,
    throwError
} from 'rxjs';

import {
    JsonIssue,
    JsonLabel,
    JsonMergeRequest,
    JsonMilestone,
    JsonPipeline,
    JsonProject,
    JsonRelease,
    JsonTag
} from './json-data';
import { Project } from './logic/Project.class';
import { Issue, IssueState } from './logic/Issue.class';
import { Milestone } from './logic/Milestone.class';
import { Pipeline } from './logic/Pipeline.class';
import { Release } from './logic/Release.class';
import { Tag } from './logic/Tag.class';
import { GitlabLogger } from './gitlab-logger.class';
import { Label } from './logic/Label.class';
import { MergeRequest } from './logic/MergeRequest.class';

export class GitlabService {
    private readonly instance: AxiosInstance;
    private readonly token: string;
    private readonly logger: GitlabLogger;

    public constructor(logger: GitlabLogger, baseURL: string, token: string) {
        this.logger = logger;
        this.token = token;
        this.instance = axios.create({ baseURL });
    }

    public getProjects(
        quantity?: number,
        search?: string
    ): Observable<Project[]> {
        const card = quantity ? quantity : 100;
        let path = `/projects?pagination=keyset&per_page=${card}&order_by=id&sort=desc&membership=true`;
        if (search) path += `&search=${search}`;
        const jsonProjects$ = from(
            this.mountGetRequest<JsonProject[]>(path)
        ).pipe(map((ax) => ax.data));
        const projects$ = jsonProjects$.pipe(
            map((jps) => jps.map((jp) => new Project(jp)))
        );
        const sorted$ = projects$.pipe(
            map((ps) => ps.sort((p1, p2) => p1.name.localeCompare(p2.name)))
        );
        return sorted$;
    }

    public getAllIssues(
        projectName: string,
        quantity?: number
    ): Observable<Issue[]> {
        const project$ = this._getProjectByName(projectName);
        const issues$ = project$.pipe(
            mergeMap((p) => this._getAllIssues(p.id, quantity))
        );
        return issues$;
    }

    public getIssuesWithState(
        projectName: string,
        state: IssueState,
        quantity?: number
    ): Observable<Issue[]> {
        const project$ = this._getProjectByName(projectName);
        const issues$ = project$.pipe(
            mergeMap((p) => this._getIssuesWithState(p.id, state, quantity))
        );
        return issues$;
    }

    public getMilestones(
        projectName: string,
        onlyActive: boolean,
        quantity?: number
    ): Observable<Milestone[]> {
        const project$ = this._getProjectByName(projectName);
        const milestones$ = project$.pipe(
            mergeMap((p) => this._getMilestones(p.id, onlyActive, quantity))
        );
        return milestones$;
    }

    public getMergeRequests(
        projectName: string,
        onlyOpened: boolean,
        quantity?: number
    ): Observable<MergeRequest[]> {
        const project$ = this._getProjectByName(projectName);
        const mergeRequests$ = project$.pipe(
            mergeMap((p) => this._getMergeRequests(p.id, onlyOpened, quantity))
        );
        return mergeRequests$;
    }

    public getLabels(
        projectName: string,
        quantity?: number
    ): Observable<Label[]> {
        const project$ = this._getProjectByName(projectName);
        const labels$ = project$.pipe(
            mergeMap((p) => this._getLabels(p.id, quantity))
        );
        return labels$;
    }

    public getReleaseByNames(
        projectName: string,
        releaseName: string
    ): Observable<Release> {
        const projectRelease$ = this._getReleaseByNames(
            projectName,
            releaseName
        );
        const release$ = projectRelease$.pipe(map((pr) => pr[1]));
        return release$;
    }

    public getPipelines(
        projectName: string,
        quantity?: number
    ): Observable<Pipeline[]> {
        const project$ = this._getProjectByName(projectName);
        const pipelines$ = project$.pipe(
            mergeMap((p) => this._getPipelines(p.id, quantity))
        );
        return pipelines$;
    }

    public getMilestoneIssues(
        projectName: string,
        milestoneName: string
    ): Observable<Issue[]> {
        const pm$ = this._getMilestoneByNames(projectName, milestoneName);
        const issues$ = pm$.pipe(
            mergeMap((pm) => {
                const projectId = pm[0].id;
                const milestoneId = pm[1].id;
                return this._getMilestoneIssues(projectId, milestoneId);
            })
        );
        return issues$;
    }

    public getReleases(
        projectName: string,
        quantity?: number
    ): Observable<Release[]> {
        const project$ = this._getProjectByName(projectName);
        const releases$ = project$.pipe(
            mergeMap((p) => this._getReleases(p.id, quantity))
        );
        return releases$;
    }

    public getReleaseIssues(
        projectName: string,
        releaseName: string
    ): Observable<Issue[]> {
        const pr$ = this._getReleaseByNames(projectName, releaseName);
        const pidMids$ = pr$.pipe(
            map((pr) => {
                const pid = pr[0].id as number;
                const mids = pr[1].milestones.map((m) => m.id);
                const r = [pid, mids] as [number, number[]];
                return r;
            })
        );
        const x$ = pidMids$.pipe(
            mergeMap((pidMids) => {
                const pid = pidMids[0];
                const mids = pidMids[1];
                return mids.map((mid) => this._getMilestoneIssues(pid, mid));
            }),
            mergeAll()
        );
        return x$;
    }

    public getTags(projectName: string, quantity?: number): Observable<Tag[]> {
        const project$ = this._getProjectByName(projectName);
        const tags$ = project$.pipe(
            mergeMap((p) => this._getTags(p.id, quantity))
        );
        return tags$;
    }

    public getIssuesWithLabel(
        projectName: string,
        label: string,
        quantity?: number
    ): Observable<Issue[]> {
        const project$ = this._getProjectByName(projectName);
        const issues$ = project$.pipe(
            mergeMap((p) => this._getAllIssuesWithLabel(p.id, label, quantity))
        );
        return issues$;
    }

    public swapIssueLabel(
        projectName: string,
        issue: Issue,
        fromLabel: string,
        toLabel: string
    ): Observable<boolean> {
        const projectId$ = this._getProjectByName(projectName).pipe(
            map((p) => (p ? p.id : undefined))
        );
        const remove$ = projectId$.pipe(
            mergeMap((p) =>
                p ? this._removeIssueLabel(p, issue, fromLabel) : of(false)
            )
        );
        const add$ = projectId$.pipe(
            mergeMap((p) =>
                p ? this._addIssueLabel(p, issue, toLabel) : of(false)
            )
        );
        const mod$ = remove$.pipe(mergeMap((r) => (r ? add$ : of(false))));
        return mod$;
    }

    private _removeIssueLabel(
        projectId: number,
        issue: Issue,
        labelName: string
    ): Observable<boolean> {
        const path = `/projects/${projectId}/issues/${issue.iid}?remove_labels=${labelName}`;
        const req$ = from(this.mountPutRequest(path));
        const ob$ = req$.pipe(map((_r) => true));
        return ob$;
    }

    private _addIssueLabel(
        projectId: number,
        issue: Issue,
        labelName: string
    ): Observable<boolean> {
        const path = `/projects/${projectId}/issues/${issue.iid}?add_labels=${labelName}`;
        const req$ = from(this.mountPutRequest(path));
        const ob$ = req$.pipe(map((_r) => true));
        return ob$;
    }

    private _getMilestones(
        projectId: number,
        onlyActive: boolean,
        quantity?: number
    ): Observable<Milestone[]> {
        const card = quantity ? quantity : 100;
        const path = `/projects/${projectId}/milestones?per_page=${card}`;
        const jsonMilestones$ = from(
            this.mountGetRequest<JsonMilestone[]>(path)
        ).pipe(map((ax) => ax.data));
        const milestones$ = jsonMilestones$.pipe(
            map((jms) => jms.map((jm) => new Milestone(jm)))
        );
        const results$ = onlyActive
            ? milestones$.pipe(
                  map((ms) => ms.filter((m) => m.state === 'active'))
              )
            : milestones$;
        return results$.pipe(map((ms) => ms.sort((m1, m2) => m2.id - m1.id)));
    }

    private _getMergeRequests(
        projectId: number,
        onlyOpened: boolean,
        quantity?: number
    ): Observable<MergeRequest[]> {
        const card = quantity ? quantity : 100;
        const path = `/projects/${projectId}/merge_requests?per_page=${card}`;
        const jsonMergeRequests$ = from(
            this.mountGetRequest<JsonMergeRequest[]>(path)
        ).pipe(map((ax) => ax.data));
        const mergeRequests$ = jsonMergeRequests$.pipe(
            map((jms) => jms.map((jm) => new MergeRequest(jm)))
        );
        const results$ = onlyOpened
            ? mergeRequests$.pipe(
                  map((ms) => ms.filter((m) => m.state === 'opened'))
              )
            : mergeRequests$;
        return results$.pipe(map((ms) => ms.sort((m1, m2) => m2.id - m1.id)));
    }

    private _getLabels(
        projectId: number,
        quantity?: number
    ): Observable<Label[]> {
        const card = quantity ? quantity : 100;
        const path = `/projects/${projectId}/labels?per_page=${card}`;
        const jsonLabels$ = from(this.mountGetRequest<JsonLabel[]>(path)).pipe(
            map((ax) => ax.data)
        );
        const labels$ = jsonLabels$.pipe(
            map((jms) => jms.map((jm) => new Label(jm)))
        );
        return labels$;
    }

    private _getMilestone(
        projectId: number,
        milestoneId: number
    ): Observable<Milestone> {
        const path = `/projects/${projectId}/milestones/${milestoneId}`;
        const jsonMilestone$ = from(
            this.mountGetRequest<JsonMilestone>(path)
        ).pipe(map((ax) => ax.data));
        const milestone$ = jsonMilestone$.pipe(map((jm) => new Milestone(jm)));
        return milestone$;
    }

    private _getMilestoneByNames(
        projectName: string,
        milestoneName: string
    ): Observable<[Project, Milestone]> {
        const project$ = this._getProjectByName(projectName);
        const milestones$ = project$.pipe(
            mergeMap((p) => this._getMilestones(p.id, false))
        );
        const milestone$ = milestones$.pipe(
            map((ms) => ms.find((m) => m.title === milestoneName))
        );
        const error$ = throwError(
            () => new Error(`milestone ${milestoneName} not found`)
        );
        const result$ = milestone$.pipe(mergeMap((m) => (m ? of(m) : error$)));
        const x$ = forkJoin([project$, result$]);
        return x$;
    }

    private _getReleaseByNames(
        projectName: string,
        releaseName: string
    ): Observable<[Project, Release]> {
        const project$ = this._getProjectByName(projectName);
        const releases$ = project$.pipe(
            mergeMap((p) => this._getReleases(p.id))
        );
        const release$ = releases$.pipe(
            map((rs) => rs.find((r) => r.name === releaseName))
        );
        const error$ = throwError(
            () => new Error(`release ${releaseName} not found`)
        );
        const result$ = release$.pipe(mergeMap((m) => (m ? of(m) : error$)));
        const x$ = forkJoin([project$, result$]);
        return x$;
    }

    private _getTagByNames(
        projectName: string,
        tagName: string
    ): Observable<[Project, Tag]> {
        const project$ = this._getProjectByName(projectName);
        const tags$ = project$.pipe(mergeMap((p) => this._getTags(p.id)));
        const tag$ = tags$.pipe(
            map((ts) => ts.find((t) => t.name === tagName))
        );
        const error$ = throwError(() => new Error(`tag ${tagName} not found`));
        const result$ = tag$.pipe(mergeMap((t) => (t ? of(t) : error$)));
        const x$ = forkJoin([project$, result$]);
        return x$;
    }

    private _getReleases(
        projectId: number,
        quantity?: number
    ): Observable<Release[]> {
        const card = quantity ? quantity : 100;
        const path = `/projects/${projectId}/releases?per_page=${card}`;
        const jsonReleases$ = from(
            this.mountGetRequest<JsonRelease[]>(path)
        ).pipe(map((ax) => ax.data));
        const releases$ = jsonReleases$.pipe(
            map((jrs) => jrs.map((jr) => new Release(jr)))
        );
        const compareFn = (r1: Release, r2: Release) =>
            r1.released_at.isBefore(r2.released_at) ? -1 : 1;
        const ordered$ = releases$.pipe(map((rs) => rs.sort(compareFn)));
        return ordered$;
    }

    private _getPipelines(
        projectId: number,
        quantity?: number
    ): Observable<Pipeline[]> {
        const card = quantity ? quantity : 100;
        const path = `/projects/${projectId}/pipelines/?per_page=${card}&order_by=id&sort=desc`;
        const jsonPipelines$ = from(
            this.mountGetRequest<JsonPipeline[]>(path)
        ).pipe(map((ax) => ax.data));
        const pipelines$ = jsonPipelines$.pipe(
            map((jps) => jps.map((jp) => new Pipeline(jp)))
        );
        return pipelines$;
    }

    private _getTags(projectId: number, quantity?: number): Observable<Tag[]> {
        const card = quantity ? quantity : 100;
        const path = `/projects/${projectId}/repository/tags?per_page=${card}`;
        const jsonTags$ = from(this.mountGetRequest<JsonTag[]>(path)).pipe(
            map((ax) => ax.data)
        );
        const tags$ = jsonTags$.pipe(
            map((jts) => jts.map((jt) => new Tag(jt)))
        );
        const compareFn = (t1: Tag, t2: Tag) =>
            t1.commit.commited_at.isBefore(t2.commit.commited_at) ? 1 : -1;
        const ordered$ = tags$.pipe(map((ts) => ts.sort(compareFn)));
        return ordered$;
    }

    private _getProjectByName(projectName: string): Observable<Project> {
        const projects$ = this.getProjects(undefined, projectName);
        const project$ = projects$.pipe(
            map((ps) => ps.find((p) => p.path === projectName))
        );
        const error$ = throwError(
            () => new Error(`project ${projectName} not found`)
        );
        const result$ = project$.pipe(mergeMap((p) => (p ? of(p) : error$)));
        return result$;
    }

    private _getIssuesWithState(
        projectId: number,
        state: IssueState,
        quantity?: number
    ): Observable<Issue[]> {
        const card = quantity ? quantity : 100;
        const path = `/projects/${projectId}/issues?per_page=${card}&state=${state.toString()}&order_by=created_at`;
        const jsonIssues$ = from(this.mountGetRequest<JsonIssue[]>(path)).pipe(
            map((ax) => ax.data)
        );
        const issues$ = jsonIssues$.pipe(
            map((jis) => jis.map((ji) => new Issue(ji)))
        );
        return issues$;
    }

    private _getAllIssues(
        projectId: number,
        quantity?: number
    ): Observable<Issue[]> {
        const card = quantity ? quantity : 100;
        const path = `/projects/${projectId}/issues?per_page=${card}&order_by=created_at`;
        const jsonIssues$ = from(this.mountGetRequest<JsonIssue[]>(path)).pipe(
            map((ax) => ax.data)
        );
        const issues$ = jsonIssues$.pipe(
            map((jis) => jis.map((ji) => new Issue(ji)))
        );
        return issues$;
    }

    private _getAllIssuesWithLabel(
        projectId: number,
        labelName: string,
        quantity?: number
    ): Observable<Issue[]> {
        const card = quantity ? quantity : 100;
        const path = `/projects/${projectId}/issues?per_page=${card}&labels=${labelName}`;
        const jsonIssues$ = from(this.mountGetRequest<JsonIssue[]>(path)).pipe(
            map((ax) => ax.data)
        );
        const issues$ = jsonIssues$.pipe(
            map((jis) => jis.map((ji) => new Issue(ji)))
        );
        return issues$;
    }

    private _getMilestoneIssues(
        projectId: number,
        milestoneId: number
    ): Observable<Issue[]> {
        // Este endpoint não permite o sort. Logo, a ordenação é feita no método.
        const path = `/projects/${projectId}/milestones/${milestoneId}/issues`;
        const jsonIssues$ = from(this.mountGetRequest<JsonIssue[]>(path)).pipe(
            map((ax) => ax.data)
        );
        const issues$ = jsonIssues$.pipe(
            map((jis) => jis.map((ji) => new Issue(ji)))
        );
        const sorted$ = issues$.pipe(
            map((is) => is.sort((i1, i2) => (i1.id < i2.id ? 1 : -1)))
        );
        return sorted$;
    }

    private mountUrl(path: string): string {
        const url = `/api/v4/${path}`;
        return url;
    }

    private mountGetRequest<T>(path: string): Promise<AxiosResponse<T, any>> {
        const pth = this.mountUrl(path);
        this.logger.logUrl('get', pth);
        return this.instance.get<T>(pth, {
            headers: { 'PRIVATE-TOKEN': this.token }
        });
    }

    private mountPutRequest(path: string): Promise<AxiosResponse<any, any>> {
        const pth = this.mountUrl(path);
        this.logger.logUrl('put', pth);
        return this.instance.put(pth, undefined, {
            headers: { 'PRIVATE-TOKEN': this.token }
        });
    }
}
