#!/usr/bin/env node

import { readFileSync } from 'fs';
import yargs, { config } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Config } from './config';
import { Issue, Milestone } from './http-client';
import { Logger } from './logger';


function addPidOption(x: yargs.Argv): yargs.Argv {
  return x.option(Config.PID_TAG, { type: 'number', alias: 'pid', demandOption: true, description: "Set the project id" });
}

function addMidOption(x: yargs.Argv): yargs.Argv {
  return x.option(Config.MID_TAG, { type: 'number', alias: 'mid', demandOption: true, description: "Set the milestone id" });
}

function getIssueStateText(issue: Issue): string {
  const state = issue.state;
  const opened = issue.state.trim().toLowerCase() === "opened";
  const stateStr = opened ? Logger.toRed(state) : state;
  return stateStr;
}

function getMilestoneStateText(milestone: Milestone): string {
  const state = milestone.state;
  const active = milestone.state.trim().toLowerCase() === "active";
  const stateStr = active ? Logger.toYellow(state) : state;
  return stateStr;
}


const argv = yargs(hideBin(process.argv))
  .scriptName('gitlab-cli')
  .usage('$0 <command> --token <token> --url <url> [arguments]')
  .options({
    verbose: { default: false, demandOption: false, type: 'boolean', description: "Show logs" },
    token: { demandOption: false, type: 'string', description: "Set personel access token" },
    url: { demandOption: false, type: 'string', description: "Set GitLab URL" },
    'auto-token': { demandOption: false, type: 'boolean', description: `Use access token from file ${Config.CONFIG_FILE_NAME} at $HOME` },
    'auto-url': { demandOption: false, type: 'boolean', description: `Use URL from file ${Config.CONFIG_FILE_NAME} at $HOME` },
  })

  .command(`opened-issues`, "see opened issues",
    (yargs) => {
      addPidOption(yargs);
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projectId = config.getPid();
      const issues$ = httpClient.getOpenedIssues(projectId);
      issues$.subscribe(issues => {
        issues.forEach(i => config.logger.printItem(i.title))
      });
    })

  .command(`release-notes`, "see release notes",
    (yargs) => {
      addPidOption(yargs);
      addMidOption(yargs);
    },
    (argv) => {
      const config = new Config(argv);
      const projectId = config.getPid();
      const milestoneId = config.getMid();
      const httpClient = config.createHttpClient();
      const issues$ = httpClient.getMilestoneIssues(projectId, milestoneId);
      issues$.subscribe(issues => {
        issues.forEach(i => {
          config.logger.printItem(`[#${i.id}] (${getIssueStateText(i)}) - ${i.title} `)
        });
      });
    })

  .command("projects", "see projects (user is a member)",
    (yargs) => {
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projects$ = httpClient.getProjects();
      projects$.subscribe(projects => {
        projects.forEach(p => config.logger.printItem(`[id:${p.id}] : ${p.name} - ${p.path_with_namespace}`));
      });
    })

  .command(`milestones`, "see project milestones",
    (yargs) => {
      addPidOption(yargs);
      yargs.option({ 'only-active': { default: false, demandOption: false, type: 'boolean', description: "Show only active milestones" } });
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projectId = config.getPid();
      const onlyActive = config.getExtraBooleanValue('only-active');
      const milestones$ = httpClient.getMilestones(projectId, onlyActive);
      milestones$.subscribe(milestones => {
        milestones.forEach(m => config.logger.printItem(`[id:${m.id}] (${getMilestoneStateText(m)}) - ${m.title}`));
      });
    })

  .conflicts('token', 'auto-token')
  .conflicts('url', 'auto-url')
  .strict()
  // .option('command', { description: "command to be executed", choices: ["release-notes", "opened-issues"]})
  // Useful aliases.
  .help()
  .argv;



