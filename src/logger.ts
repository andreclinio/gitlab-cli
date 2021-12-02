import { Moment } from "moment";

export class Logger {
  private readonly verbose: boolean;

  public static readonly RED = "\x1b[31m";
  public static readonly YELLOW = "\x1b[33m";
  public static readonly GREEN = "\x1b[32m";
  public static readonly CYAN = "\x1b[36m";
  public static readonly RESET = "\x1b[0m";

  constructor(verbose: boolean) {
    this.verbose = verbose;
    this.log(`Verbose mode: ${verbose}`);
  }

  log(text: string): void {
    if (!this.verbose) return;
    this.toConsole(`[LOG]: ${text}`);
  }

  exit(text: string) {
    this.toConsole(`[EXIT]: ${Logger.toRed(text)}`);
    process.exit(1);
  }

  print(text: string): void {
    this.toConsole(`[OUT]: ${text}`);
  }

  printItem(text: string, level?: number): void {
    const ident = !level ? 1 : level;
    const str = `${" ".repeat((ident - 1) * 3)} - ${text}`;
    this.toConsole(str);
  }

  static toRed(text: string): string {
    return `${Logger.RED}${text}${Logger.RESET}`;
  }

  static toGreen(text: string): string {
    return `${Logger.GREEN}${text}${Logger.RESET}`;
  }

  static toYellow(text: string): string {
    return `${Logger.YELLOW}${text}${Logger.RESET}`;
  }

  static toCyan(text: string): string {
    return `${Logger.CYAN}${text}${Logger.RESET}`;
  }

  static dthr(moment: Moment): string {
    if (!moment) return "?";
    return `${moment.format("DD/MM/YYYY HH:mm:ss")}`;
  }

  private toConsole(text: string): void {
    // tslint:disable-next-line:no-console
    console.info(text);
  }
}
