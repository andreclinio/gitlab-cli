export type GitlabLoggerUrlType = 'put' | 'get' | 'post';
export interface GitlabLogger {
    logUrl(type: GitlabLoggerUrlType, text: string): void;
}
