#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { HttpClient } from './http-client';
import { Logger } from './logger';

const PID_TAG = 'project-id';
const MID_TAG = 'milestone-id';

function getPidValue(logger: Logger, x: yargs.Arguments): number {
  const projectId = x[PID_TAG] as number;
  logger.log(`project id: ${projectId}`);
  return projectId;
}

function getPidArgs(): string {
  return `--${PID_TAG} <${PID_TAG}>`;
}

function getMidArgs(): string {
  return `--${MID_TAG} <${MID_TAG}>`;
}

function getMidValue(logger: Logger, x: yargs.Arguments): number {
  const milestoneId = x[MID_TAG] as number;
  logger.log(`milestone id: ${milestoneId}`);
  return milestoneId;
}

function addPidOption(x: yargs.Argv): yargs.Argv {
  return x.option(PID_TAG, { type: 'number', alias: 'pid', demandOption: true });
}

function addMidOption(x: yargs.Argv): yargs.Argv {
  return x.option(MID_TAG, { type: 'number', alias: 'mid', demandOption: true });
}

function isOpened(text: string) : boolean {
  return text.trim().toLowerCase() === "opened";
}

function getStateText(state: string) : string {
  const opened = isOpened(state);
  const stateStr = opened ? `${Logger.RED}${state}${Logger.RESET}` : state;
  return stateStr;
}

const argv = yargs(hideBin(process.argv))
  .scriptName('gitlab-cli')
  .usage('$0 <command> --token <token> --url <url> [arguments]')
  .options({
    verbose: { default: false, demandOption: false, type: 'boolean', description: "Show logs" },
    token: { demandOption: true, type: 'string', description: "Set personel access token" },
    url: { demandOption: true, type: 'string', description: "Set GitLab Url" },
  })

  .command(`opened-issues`, "see opened issues",
    (yargs) => {
      addPidOption(yargs);
    },
    (argv) => {
      const logger = new Logger(argv.verbose);
      const projectId = getPidValue(logger, argv);
      const httpClient = new HttpClient(logger, argv.url, argv.token);
      const issues$ = httpClient.getOpenedIssues(projectId);
      issues$.subscribe(issues => {
        issues.forEach(i => logger.printItem(i.title))
      });
    })

  .command(`release-notes`, "see release notes",
    (yargs) => {
      addPidOption(yargs);
      addMidOption(yargs);
    },
    (argv) => {
      const logger = new Logger(argv.verbose);
      const projectId = getPidValue(logger, argv);
      const milestoneId = getMidValue(logger, argv);
      const httpClient = new HttpClient(logger, argv.url, argv.token);
      const issues$ = httpClient.getMilestoneIssues(projectId, milestoneId);
      issues$.subscribe(issues => {
        issues.forEach(i => {
          const stateStr = getStateText(i.state);
          logger.printItem(`[#${i.id}] (${stateStr}) - ${i.title} `)
        });
      });
    })

  .command("projects", "see projects (user is a member)",
    (yargs) => {
    },
    (argv) => {
      const logger = new Logger(argv.verbose);
      const httpClient = new HttpClient(logger, argv.url, argv.token);
      const projects$ = httpClient.getProjects();
      projects$.subscribe(projects => {
        projects.forEach(p => logger.printItem(`[id:${p.id}] : ${p.name} - ${p.path_with_namespace}`));
      });
    })

  .command(`milestones`, "see project milestones",
    (yargs) => {
      addPidOption(yargs);
    },
    (argv) => {
      const logger = new Logger(argv.verbose);
      const projectId = getPidValue(logger, argv);
      const httpClient = new HttpClient(logger, argv.url, argv.token);
      const milestones$ = httpClient.getMilestones(projectId);
      milestones$.subscribe(milestones => {
        milestones.forEach(m => logger.printItem(`[id:${m.id}] : ${m.title} - ${m.state}`));
      });
    })


  .strict()
  // .option('command', { description: "command to be executed", choices: ["release-notes", "opened-issues"]})
  // Useful aliases.
  .help()
  .argv;



