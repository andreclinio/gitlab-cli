#!/usr/bin/env node


import { map, mergeMap, throwError } from 'rxjs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Config } from './config';
import { Logger } from './logger';

function addPnaOption(argv: yargs.Argv): yargs.Argv {
  return argv.option(Config.PNA_TAG, { type: 'string', alias: 'pna', demandOption: true, description: "Set the project name" });
}

function addRnaOption(argv: yargs.Argv): yargs.Argv {
  return argv.option(Config.RNA_TAG, { type: 'string', alias: 'rna', demandOption: true, description: "Set the release name" });
}

function addTnaOption(argv: yargs.Argv): yargs.Argv {
  return argv.option(Config.TNA_TAG, { type: 'string', alias: 'tna', demandOption: true, description: "Set the tag name" });
}

function addMnaOption(argv: yargs.Argv): yargs.Argv {
  return argv.option(Config.MNA_TAG, { type: 'string', alias: 'mna', demandOption: true, description: "Set the milestone name" });
}

function addQuantityOption(argv: yargs.Argv): yargs.Argv {
  return argv.option({ 'quantity': { alias: 'n', demandOption: false, type: 'number', description: "Show only <n> items" } });
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

  .command("projects", "see projects (user is a member)",
    (yargs) => {
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projects$ = httpClient.getProjects();
      projects$.subscribe({
        next: projects => {
          projects.forEach(p => config.logger.printItem(`[id:${p.id}] : ${p.name} - ${p.path_with_namespace}`));
        },
        error: (err) => {
          config.logger.exit(err);
        }
      });
    })

  .command(`opened-issues`, "see opened issues",
    (yargs) => {
      addPnaOption(yargs);
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projectName = config.getPna();
      const issues$ = httpClient.getOpenedIssues(projectName);
      issues$.subscribe({
        next: (issues) => {
          issues.forEach(i => config.logger.printItem(`[#${i.iid}] - ${i.title}`));
        },
        error: (err) => {
          config.logger.exit(err);
        }
      });
    })

  .command(`milestone-issues`, "see milestone issues",
    (yargs) => {
      addPnaOption(yargs);
      addMnaOption(yargs);
    },
    (argv) => {
      const config = new Config(argv);
      const milestoneName = config.getMna();
      const projectName = config.getPna();
      const httpClient = config.createHttpClient();
      const issues$ = httpClient.getMilestoneIssues(projectName, milestoneName);
      issues$.subscribe({
        next: (issues) => {
          issues.forEach(i => {
            config.logger.printItem(`[#${i.iid}] (${i.stateText}) - ${i.title} `);
          })
        },
        error: (err) => {
          config.logger.exit(err);
        }
      });
    })

  .command(`release-issues`, "see release issues",
    (yargs) => {
      addPnaOption(yargs);
      addRnaOption(yargs);
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projectName = config.getPna();
      const releaseNa = config.getRna();
      const issues$ = httpClient.getReleaseIssues(projectName, releaseNa);
      issues$.subscribe({
        next: (issues) => {
          issues.forEach(i => {
            config.logger.printItem(`[#${i.iid}] (${i.stateText}) - ${i.title} `);
          })
        },
        error: (err) => {
          config.logger.exit(err);
        }
      });
    })


  .command(`milestones`, "see project milestones",
    (yargs) => {
      addPnaOption(yargs);
      addQuantityOption(yargs);
      yargs.option({ 'only-active': { default: false, demandOption: false, type: 'boolean', description: "Show only active milestones" } });
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projectId = config.getPna();
      const quantity = config.getQuantity();
      const onlyActive = config.getExtraBooleanValue('only-active');
      const milestones$ = httpClient.getMilestones(projectId, onlyActive, quantity);
      milestones$.subscribe({
        next: milestones => {
          milestones.forEach(m => config.logger.printItem(`[id:${m.id}] (${m.stateText}) - ${m.title}`));
        },
        error: (err) => {
          config.logger.exit(err);
        }
      });
    })

  .command(`releases`, "see project releases",
    (yargs) => {
      addPnaOption(yargs);
      addQuantityOption(yargs);
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projectName = config.getPna();
      const quantity = config.getQuantity();
      const releases$ = httpClient.getReleases(projectName, quantity);
      releases$.subscribe({
        next: releases => {
          releases.forEach(r => {
            config.logger.printItem(`[${r.name}] - ${r.description} - ${r.released_at}`);
            const milestones = r.milestones
            milestones.forEach(m => config.logger.printItem(`[id:${m.id}] (${m.stateText}) - ${m.title}`, 2));
          });
        },
        error: (err) => {
          config.logger.exit(err);
        }
      })
    })

  .command(`pipelines`, "see project pipelines",
    (yargs) => {
      addPnaOption(yargs);
      addQuantityOption(yargs);
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projectName = config.getPna();
      const quantity = config.getQuantity();
      const pipelines$ = httpClient.getPipelines(projectName, quantity);
      pipelines$.subscribe({
        next: pipelines => {
          pipelines.forEach(p => {
            config.logger.printItem(`[${p.id}] (${p.statusText}) - ${p.ref} - ${Logger.dthr(p.created_at)} :: ${p.sha_resumed}`);
          });
        },
        error: (err) => {
          config.logger.exit(err);
        }
      })
    })


  .command(`tags`, "see project tags",
    (yargs) => {
      addPnaOption(yargs);
      addQuantityOption(yargs);
    },
    (argv) => {
      const config = new Config(argv);
      const quantity = config.getQuantity();
      const httpClient = config.createHttpClient();
      const projectName = config.getPna();
      const tags$ = httpClient.getTags(projectName, quantity);
      tags$.subscribe({
        next: tags => {
          tags.forEach(t => {
            config.logger.printItem(`[${t.name}] - ${t.message} - ${Logger.dthr(t.commit.commited_at)}`);
          });
        },
        error: (err) => {
          config.logger.exit(err);
        }
      })
    })

  .conflicts('token', 'auto-token')
  .conflicts('url', 'auto-url')
  .strict()
  // .option('command', { description: "command to be executed", choices: ["release-notes", "opened-issues"]})
  // Useful aliases.
  .help()
  .argv;



