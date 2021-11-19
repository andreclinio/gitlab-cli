#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { HttpClient } from './http-client';
import { Logger } from './logger';

const argv = yargs(hideBin(process.argv))
  .scriptName('gitlab-cli')
  .usage('$0 <command> --token <token> --url <url> [arguments]')
  .options({
    verbose: { default: false, demandOption: false, type: 'boolean', description: "Show logs" },
    token: { demandOption: true, type: 'string', description: "Set personel access token" },
    url: { demandOption: true, type: 'string', description: "Set GitLab Url" },
  })
  .command("opened-issues", "see opened issues",
    (yargs) => {
      yargs.option('project-id', { type: 'number' });
    },
    (argv) => {
      const logger = new Logger(argv.verbose);
      const projectId = argv['project-id'] as number;
      logger.log(`project id: ${projectId}`);
      const httpClient = new HttpClient(argv.url, argv.token);
      const issues$ = httpClient.getOpenedIssues(projectId);
      issues$.subscribe(issues => {
        issues.forEach(i => logger.printItem(i.title))
      });
    })

  .command("release-notes", "see release notes",
    (yargs) => {
      yargs.option('project-id', { type: 'number' });
      yargs.option('milestone-id', { type: 'number' });
    },
    (argv) => {
      const logger = new Logger(argv.verbose);
      const projectId = argv['project-id'] as number;
      const milestoneId = argv['milestone-id'] as number;
      logger.log(`project id: ${projectId}`);
      logger.log(`milestone id: ${milestoneId}`);
      const httpClient = new HttpClient(argv.url, argv.token);
      const issues$ = httpClient.getMilestoneIssues(projectId, milestoneId);
      issues$.subscribe(issues => {
        issues.forEach(i => logger.printItem(`[#${i.id}] - ${i.title} (${i.state})`));
      });
    })

  .command("projects", "see projects (user is a member)",
    (yargs) => {
    },
    (argv) => {
      const logger = new Logger(argv.verbose);
      const httpClient = new HttpClient(argv.url, argv.token);
      const projects$ = httpClient.getProjects();
      projects$.subscribe(projects => {
        projects.forEach(p => logger.printItem(`[id:${p.id}] : ${p.name} - ${p.path_with_namespace}`));
      });
    })

  .command("milestones", "see project milestones",
    (yargs) => {
      yargs.option('project-id', { type: 'number' });
    },
    (argv) => {
      const logger = new Logger(argv.verbose);
      const projectId = argv['project-id'] as number;
      logger.log(`project id: ${projectId}`);
      const httpClient = new HttpClient(argv.url, argv.token);
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



