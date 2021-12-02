import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  forkJoin,
  from,
  map,
  mergeAll,
  mergeMap,
  Observable,
  of,
  throwError,
} from "rxjs";

import { Logger } from "./logger";
import {
  JsonIssue,
  JsonMilestone,
  JsonPipeline,
  JsonProject,
  JsonRelease,
  JsonTag,
} from "./json-data";
import { Issue, Milestone, Pipeline, Project, Release, Tag } from "./logic";

export class HttpClient {
  private readonly instance: AxiosInstance;
  private readonly token: string;
  private readonly logger: Logger;

  public constructor(logger: Logger, baseURL: string, token: string) {
    this.logger = logger;
    this.token = token;
    this.instance = axios.create({
      baseURL,
    });
  }

  public getProjects(quantity?: number): Observable<Project[]> {
    const card = quantity ? quantity : 100;
    const path = `/projects?per_page=${card}&order_by=name&sort=asc&membership=true`;
    const jsonProjects$ = from(this.mountGetRequest<JsonProject[]>(path)).pipe(
      map((ax) => ax.data)
    );
    const projects$ = jsonProjects$.pipe(
      map((jps) => jps.map((jp) => new Project(jp)))
    );
    return projects$;
  }

  public getOpenedIssues(projectName: string): Observable<Issue[]> {
    const project$ = this._getProjectByName(projectName);
    const issues$ = project$.pipe(mergeMap((p) => this._getOpenedIssues(p.id)));
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

  public getSucessfulPipelineofTag(
    projectName: string,
    tagName: string
  ): Observable<Pipeline | undefined> {
    const pipelines$ = this.getPipelines(projectName);
    const pipeline$ = pipelines$.pipe(
      map((ps) => ps.find((p) => p.success && p.ref === tagName))
    );
    return pipeline$;
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
    const x$ = this._getMilestoneByNames(projectName, milestoneName);
    const issues$ = x$.pipe(
      mergeMap((x) => this._getMilestoneIssues(x[0].id, x[1].id))
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
    const tags$ = project$.pipe(mergeMap((p) => this._getTags(p.id, quantity)));
    return tags$;
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
      ? milestones$.pipe(map((ms) => ms.filter((m) => m.state === "active")))
      : milestones$;
    return results$.pipe(map((ms) => ms.sort((m1, m2) => m2.id - m1.id)));
  }

  private _getMilestone(
    projectId: number,
    milestoneId: number
  ): Observable<Milestone> {
    const path = `/projects/${projectId}/milestones/${milestoneId}`;
    const jsonMilestone$ = from(this.mountGetRequest<JsonMilestone>(path)).pipe(
      map((ax) => ax.data)
    );
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
    const result$ = milestone$.pipe(
      mergeMap((m) =>
        m
          ? of(m)
          : throwError(() => new Error(`milestone ${milestoneName} not found`))
      )
    );
    const x$ = forkJoin([project$, result$]);
    return x$;
  }

  private _getReleaseByNames(
    projectName: string,
    releaseName: string
  ): Observable<[Project, Release]> {
    const project$ = this._getProjectByName(projectName);
    const releases$ = project$.pipe(mergeMap((p) => this._getReleases(p.id)));
    const release$ = releases$.pipe(
      map((rs) => rs.find((r) => r.name === releaseName))
    );
    const result$ = release$.pipe(
      mergeMap((m) =>
        m
          ? of(m)
          : throwError(() => new Error(`release ${releaseName} not found`))
      )
    );
    const x$ = forkJoin([project$, result$]);
    return x$;
  }

  private _getTagByNames(
    projectName: string,
    tagName: string
  ): Observable<[Project, Tag]> {
    const project$ = this._getProjectByName(projectName);
    const tags$ = project$.pipe(mergeMap((p) => this._getTags(p.id)));
    const tag$ = tags$.pipe(map((ts) => ts.find((t) => t.name === tagName)));
    const result$ = tag$.pipe(
      mergeMap((t) =>
        t ? of(t) : throwError(() => new Error(`tag ${tagName} not found`))
      )
    );
    const x$ = forkJoin([project$, result$]);
    return x$;
  }

  private _getReleases(
    projectId: number,
    quantity?: number
  ): Observable<Release[]> {
    const card = quantity ? quantity : 100;
    const path = `/projects/${projectId}/releases?per_page=${card}`;
    const jsonReleases$ = from(this.mountGetRequest<JsonRelease[]>(path)).pipe(
      map((ax) => ax.data)
    );
    const releases$ = jsonReleases$.pipe(
      map((jrs) => jrs.map((jr) => new Release(jr)))
    );
    const ordered$ = releases$.pipe(
      map((rs) =>
        rs.sort((r1, r2) => (r1.released_at.isBefore(r2.released_at) ? 1 : 1))
      )
    );
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
    const path = `/projects/${projectId}/repository/tags?order_by=updated&sort=desc&per_page=${card}`;
    const jsonTags$ = from(this.mountGetRequest<JsonTag[]>(path)).pipe(
      map((ax) => ax.data)
    );
    const tags$ = jsonTags$.pipe(map((jts) => jts.map((jt) => new Tag(jt))));
    const ordered$ = tags$.pipe(
      map((ts) =>
        ts.sort((t1, t2) =>
          t1.commit.commited_at.isBefore(t2.commit.commited_at) ? 1 : 1
        )
      )
    );
    return ordered$;
  }

  private _getProjectByName(projectName: string): Observable<Project> {
    const projects$ = this.getProjects();
    const project$ = projects$.pipe(
      map((ps) => ps.find((p) => p.name === projectName))
    );
    const result$ = project$.pipe(
      mergeMap((p) =>
        p
          ? of(p)
          : throwError(() => new Error(`project ${projectName} not found`))
      )
    );
    return result$;
  }

  private _getOpenedIssues(projectId: number): Observable<Issue[]> {
    const path = `/projects/${projectId}/issues`;
    const jsonIssues$ = from(this.mountGetRequest<JsonIssue[]>(path)).pipe(
      map((ax) => ax.data)
    );
    const issues$ = jsonIssues$.pipe(
      map((jis) => jis.map((ji) => new Issue(ji)))
    );
    const opened$ = issues$.pipe(
      map((issues) => issues.filter((i) => i.state === "opened"))
    );
    return opened$;
  }

  private _getMilestoneIssues(
    projectId: number,
    milestoneId: number
  ): Observable<Issue[]> {
    const path = `/projects/${projectId}/milestones/${milestoneId}/issues`;
    const jsonIssues$ = from(this.mountGetRequest<JsonIssue[]>(path)).pipe(
      map((ax) => ax.data)
    );
    const issues$ = jsonIssues$.pipe(
      map((jis) => jis.map((ji) => new Issue(ji)))
    );
    return issues$;
  }

  private mountUrl(path: string): string {
    const url = `/api/v4/${path}`;
    return url;
  }

  private mountGetRequest<T>(path: string): Promise<AxiosResponse<T, any>> {
    const auth = `Bearer ${this.token}`;
    const pth = this.mountUrl(path);
    this.logger.log(`URL: ${pth}`);
    return this.instance.get<T>(pth, { headers: { Authorization: auth } });
  }
}
