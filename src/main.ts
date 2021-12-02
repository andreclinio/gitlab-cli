#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Config } from "./config";
import { Logger } from "./logger";

function addPnaOption(argv: yargs.Argv): yargs.Argv {
  return argv.option(Config.PNA_TAG, {
    type: "string",
    alias: "pna",
    demandOption: true,
    description: "Set the project name",
  });
}

function addRnaOption(argv: yargs.Argv): yargs.Argv {
  return argv.option(Config.RNA_TAG, {
    type: "string",
    alias: "rna",
    demandOption: true,
    description: "Set the release name",
  });
}

function addTnaOption(argv: yargs.Argv): yargs.Argv {
  return argv.option(Config.TNA_TAG, {
    type: "string",
    alias: "tna",
    demandOption: true,
    description: "Set the tag name",
  });
}

function addMnaOption(argv: yargs.Argv): yargs.Argv {
  return argv.option(Config.MNA_TAG, {
    type: "string",
    alias: "mna",
    demandOption: true,
    description: "Set the milestone name",
  });
}

function addQuantityOption(argv: yargs.Argv): yargs.Argv {
  return argv.option({
    quantity: {
      alias: "n",
      demandOption: false,
      type: "number",
      description: "Show only <n> items",
    },
  });
}

// tslint:disable-next-line:no-unused-expression
yargs(hideBin(process.argv))
  .scriptName("gitlab-cli")
  .usage(
    `$0 <command> (--${Config.TOKEN_TAG} <token> || --${Config.AUTO_TOKEN_TAG}) (--${Config.URL_TAG} <url> || --${Config.AUTO_URL_TAG}) [arguments]`
  )
  .options({
    verbose: {
      default: false,
      demandOption: false,
      type: "boolean",
      description: "Show logs",
    },
    token: {
      demandOption: false,
      type: "string",
      description: "Set personel access token",
    },
    url: { demandOption: false, type: "string", description: "Set GitLab URL" },
    "auto-token": {
      demandOption: false,
      type: "boolean",
      description: `Use access token from file ${Config.CONFIG_FILE_NAME} at $HOME`,
    },
    "auto-url": {
      demandOption: false,
      type: "boolean",
      description: `Use URL from file ${Config.CONFIG_FILE_NAME} at $HOME`,
    },
  })

  .command(
    "projects",
    "see projects (user is a member)",
    // tslint:disable-next-line:no-empty
    (args) => {
      addQuantityOption(args);
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const quantity = config.getQuantity();
      const projects$ = httpClient.getProjects(quantity);
      projects$.subscribe({
        next: (projects) => {
          projects.forEach((p) =>
            config.logger.printItem(
              `[id:${p.id}] : ${p.name} - ${p.path_with_namespace}`
            )
          );
        },
        error: (err) => {
          config.logger.exit(err);
        },
      });
    }
  )

  .command(
    `opened-issues`,
    "see opened issues",
    (argv) => {
      addPnaOption(argv);
    },
    (argv) => {
      const config = new Config(argv);
      const httpClient = config.createHttpClient();
      const projectName = config.getPna();
      const issues$ = httpClient.getOpenedIssues(projectName);
      issues$.subscribe({
        next: (issues) => {
          issues.forEach((i) =>
            config.logger.printItem(`[#${i.iid}] - ${i.title}`)
          );
        },
        error: (err) => {
          config.logger.exit(err);
        },
      });
    }
  )

  .command(
    `milestone-issues`,
    "see milestone issues",
    (argv) => {
      addPnaOption(argv);
      addMnaOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const milestoneName = config.getMna();
      const projectName = config.getPna();
      const httpClient = config.createHttpClient();
      const issues$ = httpClient.getMilestoneIssues(projectName, milestoneName);
      issues$.subscribe({
        next: (issues) => {
          issues.forEach((i) => {
            config.logger.printItem(
              `[#${i.iid}] (${i.stateText}) - ${i.title} `
            );
          });
        },
        error: (err) => {
          config.logger.exit(err);
        },
      });
    }
  )

  .command(
    `release-issues`,
    "see release issues",
    (argv) => {
      addPnaOption(argv);
      addRnaOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const httpClient = config.createHttpClient();
      const projectName = config.getPna();
      const releaseNa = config.getRna();
      const issues$ = httpClient.getReleaseIssues(projectName, releaseNa);
      issues$.subscribe({
        next: (issues) => {
          issues.forEach((i) => {
            config.logger.printItem(
              `[#${i.iid}] (${i.stateText}) - ${i.title} `
            );
          });
        },
        error: (err) => {
          config.logger.exit(err);
        },
      });
    }
  )

  .command(
    `milestones`,
    "see project milestones",
    (argv) => {
      addPnaOption(argv);
      addQuantityOption(argv);
      argv.option({
        "only-active": {
          default: false,
          demandOption: false,
          type: "boolean",
          description: "Show only active milestones",
        },
      });
    },
    (args) => {
      const config = new Config(args);
      const httpClient = config.createHttpClient();
      const projectId = config.getPna();
      const quantity = config.getQuantity();
      const onlyActive = config.getExtraBooleanValue("only-active");
      const milestones$ = httpClient.getMilestones(
        projectId,
        onlyActive,
        quantity
      );
      milestones$.subscribe({
        next: (milestones) => {
          milestones.forEach((m) =>
            config.logger.printItem(
              `[id:${m.id}] (${m.stateText}) - ${m.title}`
            )
          );
        },
        error: (err) => {
          config.logger.exit(err);
        },
      });
    }
  )

  .command(
    `releases`,
    "see project releases",
    (argv) => {
      addPnaOption(argv);
      addQuantityOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const httpClient = config.createHttpClient();
      const projectName = config.getPna();
      const quantity = config.getQuantity();
      const releases$ = httpClient.getReleases(projectName, quantity);
      releases$.subscribe({
        next: (releases) => {
          releases.forEach((r) => {
            config.logger.printItem(
              `[${r.name}] tag: ${r.tag_name} - ${
                r.description
              } - ${Logger.dthr(r.released_at)}`
            );
            const milestones = r.milestones;
            milestones.forEach((m) =>
              config.logger.printItem(
                `[milestone: #${m.id}] (${m.stateText}) - ${m.title}`,
                2
              )
            );
          });
        },
        error: (err) => {
          config.logger.exit(err);
        },
      });
    }
  )

  .command(
    `pipelines`,
    "see project pipelines",
    (argv) => {
      addPnaOption(argv);
      addQuantityOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const httpClient = config.createHttpClient();
      const projectName = config.getPna();
      const quantity = config.getQuantity();
      const pipelines$ = httpClient.getPipelines(projectName, quantity);
      pipelines$.subscribe({
        next: (pipelines) => {
          pipelines.forEach((p) => {
            config.logger.printItem(
              `[${p.id}] (${p.statusText}) - ${p.ref} - ${Logger.dthr(
                p.created_at
              )} :: ${p.sha_resumed}`
            );
          });
        },
        error: (err) => {
          config.logger.exit(err);
        },
      });
    }
  )

  .command(
    `tags`,
    "see project tags",
    (argv) => {
      addPnaOption(argv);
      addQuantityOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const quantity = config.getQuantity();
      const httpClient = config.createHttpClient();
      const projectName = config.getPna();
      const tags$ = httpClient.getTags(projectName, quantity);
      tags$.subscribe({
        next: (tags) => {
          tags.forEach((t) => {
            const tagName = t.name;
            const pipeline$ = httpClient.getSucessfulPipelineofTag(
              projectName,
              tagName
            );
            pipeline$.subscribe({
              next: (pipeline) => {
                config.logger.printItem(
                  `[${tagName}] - ${t.message} - ${Logger.dthr(
                    t.commit.commited_at
                  )}`
                );
                if (pipeline)
                  config.logger.printItem(
                    `[Pipeline: #${pipeline.id}] - ${
                      pipeline.statusText
                    } - ${Logger.dthr(pipeline.created_at)}`,
                    2
                  );
                else config.logger.printItem(`[No pipeline]`, 2);
              },
              error: (err) => {
                config.logger.exit(err);
              },
            });
          });
        },
        error: (err) => {
          config.logger.exit(err);
        },
      });
    }
  )

  .conflicts("token", "auto-token")
  .conflicts("url", "auto-url")
  .strict()
  // .option('command', { description: "command to be executed", choices: ["release-notes", "opened-issues"]})
  // Useful aliases.
  .help()
  .version()
  .demandCommand().recommendCommands()
  .showHelpOnFail(true)
  .epilogue(`For more information, check out the documentation at https://github.com/andreclinio/gitlab-cli`)
  .argv;
