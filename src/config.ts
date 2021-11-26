const fs = require('fs');
import { exit } from "process";
import yargs from "yargs";
import { HttpClient } from "./http-client";
import { Logger } from "./logger";

interface Data {
    token: string;
    url: string;
}

export class Config {

    private _logger: Logger;
    private _data?: Data;
    private _args: yargs.Arguments;

    public static readonly PID_TAG = 'project-id';
    public static readonly MID_TAG = 'milestone-id';
    public static readonly TOKEN_TAG = 'token';
    public static readonly URL_TAG = 'token';
    public static readonly AUTO_TOKEN_TAG = 'auto-token';
    public static readonly AUTO_URL_TAG = 'auto-url';

    public static CONFIG_FILE_NAME = '.gitlab-cli';

    constructor(args: yargs.Arguments) {

        this._logger = new Logger(args['verbose'] as boolean);
        this._logger.log(`Loading config...`);
        const home = process.env['HOME'];
        const filePath = `${home}/${Config.CONFIG_FILE_NAME}`;
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
            this._logger.log(`Config file found at ${filePath}`);
            this._data = JSON.parse(content) as Data;
        }
        else {
            this._data = undefined;
        }
        this._args = args;
    }

    get logger(): Logger {
        return this._logger;
    }

    public createHttpClient(): HttpClient {
        const token = this.getToken();
        const url = this.getUrl();
        const httpClient = new HttpClient(this._logger, url, token);
        return httpClient;
    }

    public getToken(): string {
        const autoToken = this.getExtraBooleanValue(Config.AUTO_TOKEN_TAG);
        let token: string;
        if (autoToken) {
            if (!this._data || !this._data.token) {
                this._logger.print(`No token defined inside $HOME/${Config.CONFIG_FILE_NAME} file for auto-token!`);
                exit(1);
            }
            token = this._data!.token;
        }
        else {
            token = this._args[Config.TOKEN_TAG] as string;
        }
        if (!token) {
            this._logger.print("Token not found!");
            exit(1);
        }
        this._logger.log(`token: ${token}`);
        return token;
    }

    public getUrl(): string {
        const autoUrl = this.getExtraBooleanValue(Config.AUTO_URL_TAG);
        let url: string;
        if (autoUrl) {
            if (!this._data || !this._data.url) {
                this._logger.print(`No url defined inside $HOME/${Config.CONFIG_FILE_NAME} file for auto-url!`);
                exit(1);
            }
            url = this._data!.url;
        }
        else {
            url = this._args[Config.URL_TAG] as string;
        }
        if (!url) {
            this._logger.print("URL not found!");
            exit(1);
        }
        this._logger.log(`url: ${url}`);
        return url;
    }

    public getPid(): number {
        const projectId = this._args[Config.PID_TAG] as number;
        this._logger.log(`project id: ${projectId}`);
        return projectId;
    }

    public getMid(): number {
        const milestoneId = this._args[Config.MID_TAG] as number;
        this._logger.log(`milestone id: ${milestoneId}`);
        return milestoneId;
    }

    public getExtraBooleanValue(tag: string): boolean {
        const value = this._args[tag] ? true : false;
        this._logger.log(`${tag}: ${value}`);
        return value;
    }

}