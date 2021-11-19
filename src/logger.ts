
export class Logger {
 
    private readonly verbose: boolean;

    constructor(verbose: boolean) {
        this.verbose = verbose;
        this.log(`Verbose mode: ${verbose}`);
    }

    log(text: string) : void {
      if (!this.verbose) return;
      console.log(`[LOG]: ${text}`);
    }

    printItem(text: string) : void {
        console.log(` - ${text}`);
    }
}