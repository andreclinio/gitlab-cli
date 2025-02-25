import { accessSync, constants, existsSync, readFileSync } from 'fs';
import yargs, { Arguments } from 'yargs';
import { GitlabService } from './service/gitlab-service';
import { Logger } from './logger';
import { homedir, userInfo } from 'os';
import path, { sep } from 'path';

interface Data {
    token: string;
    url: string;
}

export class Config {
    private _logger: Logger;
    private _data?: Data;
    private _args: Arguments;

    public static readonly TOKEN_TAG = 'token';
    public static readonly URL_TAG = 'url';
    public static readonly AUTO_TOKEN_TAG = 'auto-token';
    public static readonly AUTO_PROJECT_TAG = 'auto-project';
    public static readonly AUTO_URL_TAG = 'auto-url';
    public static readonly AUTO_ALL = 'auto-all';

    public static readonly RNA_TAG = 'release-name';
    public static readonly TNA_TAG = 'tag-name';
    public static readonly PNA_TAG = 'project-name';
    public static readonly MNA_TAG = 'milestone-name';
    public static readonly DETAILS_TAG = 'details';

    public static readonly QUANTITY_TAG = 'quantity';

    public static CONFIG_FILE_NAME = 'gitlab-cli.cfg';
    public static OLD_CONFIG_FILE_NAME = '.gitlab-cli';

    constructor(args: Arguments) {
        this._logger = new Logger(args.verbose as boolean);

        this._warnOldConfigFilePath();
        const filePath = this._findConfigFilePath();
        if (filePath) {
            this._logger.log(`Config file: ${filePath}...`);
            const content = readFileSync(filePath, { encoding: 'utf-8' });
            this._data = JSON.parse(content) as Data;
        } else {
            this._logger.log(Logger.toYellow('Config file not found'));
            this._data = undefined;
        }
        this._args = args;
    }

    static addPnaOption(argv: yargs.Argv): yargs.Argv {
        argv.option(Config.PNA_TAG, {
            type: 'string',
            alias: 'pna',
            demandOption: false,
            description: `Set the project name (if ${Config.AUTO_PROJECT_TAG} is disabled)`
        });
        return argv.option(Config.AUTO_PROJECT_TAG, {
            type: 'boolean',
            demandOption: false,
            description: 'Set the project name by automatic mode'
        });
    }

    static addRnaOption(argv: yargs.Argv): yargs.Argv {
        return argv.option(Config.RNA_TAG, {
            type: 'string',
            alias: 'rna',
            demandOption: true,
            description: 'Set the release name'
        });
    }

    static addTnaOption(argv: yargs.Argv): yargs.Argv {
        return argv.option(Config.TNA_TAG, {
            type: 'string',
            alias: 'tna',
            demandOption: true,
            description: 'Set the tag name'
        });
    }

    static addMnaOption(argv: yargs.Argv): yargs.Argv {
        return argv.option(Config.MNA_TAG, {
            type: 'string',
            alias: 'mna',
            demandOption: true,
            description: 'Set the milestone name'
        });
    }

    static addQuantityOption(argv: yargs.Argv): yargs.Argv {
        return argv.option({
            quantity: {
                alias: 'n',
                demandOption: false,
                type: 'number',
                description: 'Show only <n> items'
            }
        });
    }

    static addDetailsOption(argv: yargs.Argv): yargs.Argv {
        return argv.option({
            details: {
                demandOption: false,
                default: false,
                type: 'boolean',
                description: 'Show details'
            }
        });
    }

    get logger(): Logger {
        return this._logger;
    }

    public createService(): GitlabService {
        const token = this._getToken();
        const url = this._getUrl();
        const service = new GitlabService(this._logger, url, token);
        return service;
    }

    public getPna(): string {
        const autoName = this._getAutoProject();
        if (autoName !== undefined) return autoName;
        const projectName = this._args[Config.PNA_TAG] as string;
        if (projectName !== undefined) {
            this._logger.log(`project name: ${projectName}`);
            return projectName;
        }
        this.logger.exit(
            'project name is undefined! (check auto ou explict options)'
        );
        return '#undefined-project';
    }

    public getRna(): string {
        const releaseNa = this._args[Config.RNA_TAG] as string;
        this._logger.log(`release name: ${releaseNa}`);
        return releaseNa;
    }

    public getTna(): string {
        const tagNa = this._args[Config.TNA_TAG] as string;
        this._logger.log(`tag name: ${tagNa}`);
        return tagNa;
    }

    public getQuantity(): number | undefined {
        const data = this._args[Config.QUANTITY_TAG];
        if (!data) return undefined;
        const quantity = data as number;
        this._logger.log(`quantity: ${quantity}`);
        return quantity;
    }

    public dumpDetails(): boolean {
        return this.getExtraBooleanValue(Config.DETAILS_TAG);
    }

    public getMna(): string {
        const milestoneName = this._args[Config.MNA_TAG] as string;
        this._logger.log(`milestone name: ${milestoneName}`);
        return milestoneName;
    }

    public getExtraBooleanValue(tag: string): boolean {
        const value = !!this._args[tag];
        this._logger.log(`${tag} (boolean): ${value}`);
        return value;
    }

    public getExtraStringValue(tag: string): string {
        const value = this._args[tag] as string;
        this._logger.log(`${tag} (string): ${value}`);
        return value;
    }

    public getExtraNumberValue(tag: string): number | undefined {
        const value = this._args[tag] ? (this._args[tag] as number) : undefined;
        this._logger.log(`${tag} (number): ${value}`);
        return value;
    }

    private _findConfigFilePath(): string | undefined {
        const userEnv = process.env.USER || userInfo().username;
        this._logger.log(`User: ${!userEnv ? '?' : userEnv}`);
        const user = userEnv || 'no-user';

        const home = `/home/${user}`;
        this._logger.log(`Home directory: ${!home ? '?' : home}`);

        const tries = [
            `${Config.CONFIG_FILE_NAME}`,
            `${sep}home${sep}${user}${sep}${Config.CONFIG_FILE_NAME}`,
            `${sep}Users${sep}${user}${sep}${Config.CONFIG_FILE_NAME}`,
            `${homedir()}${sep}${Config.CONFIG_FILE_NAME}`
        ];

        const filePath = tries.find((t) => {
            const exists = existsSync(t);
            const access = this._canRead(t);
            const exMsg = exists
                ? Logger.toGreen('found')
                : Logger.toRed('not found');
            const acMsg = access
                ? Logger.toGreen('readable')
                : Logger.toRed('not readable');
            this._logger.log(`Look up config: ${t} (${exMsg}) (${acMsg})`);
            return exists && access;
        });
        return filePath;
    }

    private _warnOldConfigFilePath(): void {
        const userEnv = process.env.USER || userInfo().username;
        const user = userEnv || 'no-user';
        this._logger.log(`Checking old configuration file for: ${user}`);

        const cfgFile = Config.OLD_CONFIG_FILE_NAME;
        const tries = [
            `${cfgFile}`,
            `${sep}home${sep}${user}${sep}${cfgFile}`,
            `${sep}Users${sep}${user}${sep}${cfgFile}`,
            `${homedir()}${sep}${cfgFile}`
        ];

        tries.forEach((t) => {
            const exists = existsSync(t);
            if (exists) {
                const msg =
                    `${Logger.toYellow('WARNING')}: ` +
                    `Found old configuration file: ${Logger.toYellow(t)}! ` +
                    `Rename it to: ${Logger.toGreen(Config.CONFIG_FILE_NAME)}.`;
                this._logger.log(msg);
            }
        });
    }

    private _canRead(path: string): boolean {
        try {
            accessSync(path, constants.R_OK);
            return true;
        } catch (_err) {
            return false;
        }
    }

    private _getAutoProject(): string | undefined {
        const autoProject = this.getExtraBooleanValue(Config.AUTO_PROJECT_TAG);
        const autoAll = this.getExtraBooleanValue(Config.AUTO_ALL);
        if (!autoProject && !autoAll) {
            this._logger.log(
                `Project name is not defined in auto-mode. (It must be defined by [${Config.PNA_TAG}] argument)`
            );
            return undefined;
        }

        const currentDir = process.cwd();
        const projectName = path.basename(currentDir);
        this._logger.log(
            `Project name defined by current directory: ${currentDir} -> ${Logger.toYellow(projectName)}`
        );
        return projectName;
    }

    private _getToken(): string {
        const autoToken = this.getExtraBooleanValue(Config.AUTO_TOKEN_TAG);
        const autoAll = this.getExtraBooleanValue(Config.AUTO_ALL);
        let token: string;
        if (autoToken || autoAll) {
            if (!this._data || !this._data.token)
                this._logger.exit(
                    `No token defined inside $HOME/${Config.CONFIG_FILE_NAME} file for auto-token or auto-all!`
                );

            token = this._data!.token;
        } else token = this._args[Config.TOKEN_TAG] as string;

        if (!token) this._logger.exit('Token not found!');

        const n = 2;
        const prefixToken = token.substring(0, n);
        const sufixToken = token.substring(token.length - n, token.length);
        const warn = Logger.toYellow(
            '(partially ommited for security reasons)'
        );
        this._logger.log(`token: ${prefixToken}...${sufixToken} ${warn}`);
        return token;
    }

    private _getUrl(): string {
        const autoUrl = this.getExtraBooleanValue(Config.AUTO_URL_TAG);
        const autoAll = this.getExtraBooleanValue(Config.AUTO_ALL);
        let url: string;
        if (autoUrl || autoAll) {
            if (!this._data || !this._data.url)
                this._logger.exit(
                    `No url defined inside $HOME/${Config.CONFIG_FILE_NAME} file for auto-url or auto-all!`
                );

            url = this._data!.url;
        } else url = this._args[Config.URL_TAG] as string;

        if (!url) this._logger.exit('URL not found!');

        this._logger.log(`url: ${url}`);
        return url;
    }
}
