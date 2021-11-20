import { REFUSED } from "dns";

export class Logger {

    private readonly verbose: boolean;

    public static readonly RED = '\x1b[31m';
    public static readonly YELLOW = '\x1b[33m';
    public static readonly RESET = '\x1b[0m';

    constructor(verbose: boolean) {
        this.verbose = verbose;
        this.log(`Verbose mode: ${verbose}`);
    }

    log(text: string): void {
        if (!this.verbose) return;
        console.log(`[LOG]: ${text}`);
    }

    printItem(text: string): void {
        const str = ` - ${text}`;
        console.log(str);
    }

    static toRed(text: string) : string {
        return `${Logger.RED}${text}${Logger.RESET}`;
    }

    static toYellow(text: string) : string {
        return `${Logger.YELLOW}${text}${Logger.RESET}`;
    }

}