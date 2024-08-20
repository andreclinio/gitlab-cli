export type GitlabLoggerUrlType = 'put' | 'get';
export interface GitlabLogger {
    logUrl(type: GitlabLoggerUrlType, text: string): void;
}
