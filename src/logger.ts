import { Moment } from "moment";
import { GitlabLogger, GitlabLoggerUrlType } from "./service/gitlab-logger.class";

export class Logger implements GitlabLogger {

  private readonly verbose: boolean;

  public static readonly RED = "\x1b[31m";
  public static readonly YELLOW = "\x1b[33m";
  public static readonly GREEN = "\x1b[32m";
  public static readonly CYAN = "\x1b[36m";
  public static readonly MAGENTA = "\x1b[35m";
  public static readonly BOLD = "\x1b[1m";
  public static readonly RESET = "\x1b[0m";

  constructor(verbose: boolean) {
    this.verbose = verbose;
    this.log(`Verbose mode: ${verbose}`);
  }

  log(text: string): void {
    if (!this.verbose) return;
    this.toConsole(`[LOG]: ${text}`);
  }

  debug(text: string): void {
    this.toConsole(`[${Logger.toMagenta("DEBUG")}]: ${text}`);
  }

  logUrl(type: GitlabLoggerUrlType, url: string): void {
    this.log(`URL -> ${Logger.toMagenta(type)} ${Logger.toCyan(url)}`);
  }

  exit(text: string) {
    this.toConsole(`[EXIT]: ${Logger.toRed(text)}`);
    process.exit(1);
  }

  print(text: string): void {
    this.toConsole(`${text}`);
  }

  printItem(text: string, level?: number): void {
    const ident = !level ? 1 : level;
    const str = `${" ".repeat((ident - 1) * 3)}- ${text}`;
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

  static toMagenta(text: string): string {
    return `${Logger.MAGENTA}${text}${Logger.RESET}`;
  }

  static toBold(text: string): string {
    return `${Logger.BOLD}${text}${Logger.RESET}`;
  }

  static dthr(moment: Moment): string {
    if (!moment) return "?";
    return `${moment.format("DD/MM/YYYY HH:mm:ss")}`;
  }

  static presentation() {
    const text = "\n" +
      Logger.toBold("GitLab CLI - Command line interface\n") +
      "Author: André Luiz Clinio (andre.clinio@gmail.com)\n";
    // tslint:disable-next-line:no-console
    console.info(text);
  }


  private toConsole(text: string): void {
    // tslint:disable-next-line:no-console
    console.info(text);
  }
}
