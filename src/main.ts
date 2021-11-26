#!/usr/bin/env node


import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Config } from './config';

function addPidOption(argv: yargs.Argv): yargs.Argv {
  return argv.option(Config.PID_TAG, { type: 'number', alias: 'pid', demandOption: true, description: "Set the project id" });
}

function addMidOption(argv: yargs.Argv): yargs.Argv {
  return argv.option(Config.MID_TAG, { type: 'number', alias: 'mid', demandOption: true, description: "Set the milestone id" });
}

function addQuantityOption(argv: yargs.Argv): yargs.Argv {
  return argv.option({ 'quantity': { default: false, alias: 'n', demandOption: false, type: 'number', description: "Show only <n> items" } });
}


const argv = yargs(hideBin(process.argv))
  .scriptName('gitlab-cli')
  .usage(`$0 <command> (--${Config.TOKEN_TAG} <token> || --${Config.AUTO_TOKEN_TAG}) (--${Config.URL_TAG} <url> || --${Config.AUTO_URL_TAG}) [arguments]`)
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
        issues.forEach(i => config.logger.printItem(`[#${i.iid}] - ${i.title}`));
      });
    })

  .command(`milestone-issues`, "see milestone issues",
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
          config.logger.printItem(`[#${i.iid}] (${i.stateText}) - ${i.title} `)
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
      addQuantityOption(yargs);
      yargs.option({ 'only-active': { default: false, demandOption: false, type: 'boolean', description: "Show only active milestones" } });
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projectId = config.getPid();
      const quantity = config.getQuantity();
      const onlyActive = config.getExtraBooleanValue('only-active');
      const milestones$ = httpClient.getMilestones(projectId, onlyActive, quantity);
      milestones$.subscribe(milestones => {
        milestones.forEach(m => config.logger.printItem(`[id:${m.id}] (${m.stateText}) - ${m.title}`));
      });
    })

  .command(`releases`, "see project releases",
    (yargs) => {
      addPidOption(yargs);
      addQuantityOption(yargs);
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projectId = config.getPid();
      const quantity = config.getQuantity();
      const releases$ = httpClient.getReleases(projectId, quantity);
      releases$.subscribe(releases => {
        releases.forEach(r => {
          config.logger.printItem(`[${r.name}] - ${r.description} - ${r.released_at}`);
          const milestones = r.milestones
            milestones.forEach(m => config.logger.printItem(`Milestone [id:${m.id}] (${m.stateText}) - ${m.title}`, 2));
        });
      })
    })

  .command(`tags`, "see project tags",
    (yargs) => {
      addPidOption(yargs);
      addQuantityOption(yargs);
    },
    (argv) => {
      const config = new Config(argv);
      const quantity = config.getQuantity();
      const httpClient = config.createHttpClient();
      const projectId = config.getPid();
      const tags$ = httpClient.getTags(projectId, quantity);
      tags$.subscribe(tags => {
        tags.forEach(t => {
          config.logger.printItem(`[${t.name}] - ${t.message} - ${t.commit.commited_at}`);
        });
      })
    })


  .conflicts('token', 'auto-token')
  .conflicts('url', 'auto-url')
  .strict()
  // .option('command', { description: "command to be executed", choices: ["release-notes", "opened-issues"]})
  // Useful aliases.
  .help()
  .argv;



