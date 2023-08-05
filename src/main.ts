#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Config } from "./config";
import { Logger } from "./logger";
import { IssueState } from "./service/logic/Issue.class";


Logger.presentation();

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
      Config.addQuantityOption(args);
      args.option({
        "name-match": {
          demandOption: false,
          type: "string",
          description: "Show only projects with name match",
        },
      });
    },
    (argv) => {
      const config = new Config(argv);
      const gitlabService = config.createService();
      const quantity = config.getQuantity();
      const nameMatch = config.getExtraStringValue("name-match");
      const projects$ = gitlabService.getProjects(quantity, nameMatch);
      projects$.subscribe({
        next: (projects) => {
          projects.forEach((p) => config.logger.printItem(p.toString()));
          config.logger.print(`${projects.length} project(s)`);
        },
        error: (err) => config.logger.exit(err)
      });
    }
  )

  .command(
    `issues`,
    "see issues",
    (argv) => {
      Config.addPnaOption(argv);
      Config.addQuantityOption(argv);
      Config.addDetailsOption(argv);
      argv.option({
        "opened": {
          default: false,
          demandOption: false,
          type: "boolean",
          description: "Show only opened issues",
        },
      });
      argv.option({
        "closed": {
          default: false,
          demandOption: false,
          type: "boolean",
          description: "Show only closed issues",
        },
      });
    },
    (argv) => {
      const config = new Config(argv);
      const gitlabService = config.createService();
      const projectName = config.getPna();
      const quantity = config.getQuantity();
      const dumpSimple = config.dumpDetails();
      const onlyClosed = config.getExtraBooleanValue("closed");
      const onlyOpened = config.getExtraBooleanValue("opened");
      let issues$;
      if (onlyClosed && !onlyOpened)
        issues$ = gitlabService.getIssuesWithState(projectName, IssueState.CLOSED, quantity);
      else if (!onlyClosed && onlyOpened)
        issues$ = gitlabService.getIssuesWithState(projectName, IssueState.OPENED, quantity);
      else
        issues$ = gitlabService.getAllIssues(projectName, quantity);
      issues$.subscribe({
        next: (issues) => {
          issues.forEach((i) => config.logger.printItem(i.toString(dumpSimple)));
          config.logger.print(`${issues.length} issue(s)`);
        },
        error: (err) => config.logger.exit(err)
      });
    }
  )

  .command(
    `milestone-issues`,
    "see milestone issues",
    (argv) => {
      Config.addPnaOption(argv);
      Config.addMnaOption(argv);
      Config.addDetailsOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const milestoneName = config.getMna();
      const projectName = config.getPna();
      const dumpSimple = config.dumpDetails();
      const gitlabService = config.createService();
      const issues$ = gitlabService.getMilestoneIssues(projectName, milestoneName);
      issues$.subscribe({
        next: (issues) => {
          issues.forEach((i) => config.logger.printItem(i.toString(dumpSimple)));
        },
        error: (err) => config.logger.exit(err)
      });
    }
  )

  .command(
    `release-issues`,
    "see release issues",
    (argv) => {
      Config.addPnaOption(argv);
      Config.addRnaOption(argv);
      Config.addDetailsOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const gitlabService = config.createService();
      const projectName = config.getPna();
      const releaseName = config.getRna();
      const dumpSimple = config.dumpDetails();
      const issues$ = gitlabService.getReleaseIssues(projectName, releaseName);
      issues$.subscribe({
        next: (issues) => {
          issues.forEach((i) =>
            config.logger.printItem(i.toString(dumpSimple))
          )
        },
        error: (err) => config.logger.exit(err)
      });
    }
  )

  .command(
    `label-issues`,
    "see issues with label",
    (argv) => {
      Config.addPnaOption(argv);
      Config.addQuantityOption(argv);
      argv.option({
        "label": {
          default: false,
          demandOption: true,
          type: "string",
          description: "Label name",
        },
      });
    },
    (args) => {
      const config = new Config(args);
      const gitlabService = config.createService();
      const projectName = config.getPna();
      const labelName = config.getExtraStringValue("label");
      const quantity = config.getQuantity();
      const issues$ = gitlabService.getIssuesWithLabel(projectName, labelName, quantity);
      issues$.subscribe({
        next: (issues) => {
          issues.forEach((i) =>
            config.logger.printItem(i.toString(true))
          )
        },
        error: (err) => config.logger.exit(err)
      });
    }
  )

  .command(
    `milestones`,
    "see project milestones",
    (argv) => {
      Config.addPnaOption(argv);
      Config.addQuantityOption(argv);
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
      const gitlabService = config.createService();
      const projectId = config.getPna();
      const quantity = config.getQuantity();
      const onlyActive = config.getExtraBooleanValue("only-active");
      const milestones$ = gitlabService.getMilestones(projectId, onlyActive, quantity);
      milestones$.subscribe({
        next: (milestones) => milestones.forEach((m) => config.logger.printItem(m.toString())),
        error: (err) => config.logger.exit(err)
      });
    }
  )

  .command(
    `labels`,
    "see project labels",
    (argv) => {
      Config.addPnaOption(argv);
      Config.addQuantityOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const gitlabService = config.createService();
      const projectId = config.getPna();
      const quantity = config.getQuantity();
      const labels$ = gitlabService.getLabels(projectId, quantity);
      labels$.subscribe({
        next: (labels) => labels.forEach((m) => config.logger.printItem(m.toString())),
        error: (err) => config.logger.exit(err)
      });
    }
  )

  .command(
    `swap-labels`,
    "change project issues labels",
    (argv) => {
      Config.addPnaOption(argv);
      Config.addQuantityOption(argv);
      argv.option({
        "from": {
          default: false,
          demandOption: true,
          type: "string",
          description: "Source label name",
        },
      });
      argv.option({
        "to": {
          default: false,
          demandOption: true,
          type: "string",
          description: "Target label name",
        },
      });
    },
    (args) => {
      const config = new Config(args);
      const gitlabService = config.createService();
      const projectName = config.getPna();
      const quantity = config.getQuantity();
      const fromLabel = config.getExtraStringValue("from");
      const toLabel = config.getExtraStringValue("to");
      const issues$ = gitlabService.getIssuesWithLabel(projectName, fromLabel, quantity);
      issues$.subscribe({
        next: (is) => is.forEach((i) => {
          config.logger.printItem(i.toString(false));
          const mod$ = gitlabService.swapIssueLabel(projectName, i, fromLabel, toLabel);
          mod$.subscribe( m => config.logger.log( m ? "ok" : "not ok"));
        }),
        error: (err) => config.logger.exit(err)
      });
    }
  )

  .command(
    `releases`,
    "see project releases",
    (argv) => {
      Config.addPnaOption(argv);
      Config.addQuantityOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const gitlabService = config.createService();
      const projectName = config.getPna();
      const quantity = config.getQuantity();
      const releases$ = gitlabService.getReleases(projectName, quantity);
      releases$.subscribe({
        next: (releases) => {
          releases.forEach((r) => {
            config.logger.printItem(r.toString());
            const milestones = r.milestones;
            milestones.forEach((m) => config.logger.printItem(m.toString(), 2));
          });
        },
        error: (err) => {
          config.logger.exit(err);
        },
      });
    }
  )

  .command(
    `release`,
    "see project release details",
    (argv) => {
      Config.addPnaOption(argv);
      Config.addRnaOption(argv);
      Config.addQuantityOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const gitlabService = config.createService();
      const projectName = config.getPna();
      const relasesName = config.getRna();
      const release$ = gitlabService.getReleaseByNames(projectName, relasesName);
      release$.subscribe({
        next: (release) => {
          config.logger.printItem(release.toString());
          config.logger.printItem(`tag: ${release.tag_name}`, 2);
          const milestones = release.milestones;
          milestones.forEach((m) => config.logger.printItem(m.toString(), 2));
          const assets = release.assets;
          const links = assets.links;
          links.forEach((l) => config.logger.printItem(l.toString(), 2));
        },
        error: (err) => config.logger.exit(err)
      });
    }
  )

  .command(
    `pipelines`,
    "see project pipelines",
    (argv) => {
      Config.addPnaOption(argv);
      Config.addQuantityOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const gitlabService = config.createService();
      const projectName = config.getPna();
      const quantity = config.getQuantity();
      const pipelines$ = gitlabService.getPipelines(projectName, quantity);
      pipelines$.subscribe({
        next: (pipelines) => {
          pipelines.forEach((p) => config.logger.printItem(p.toString()));
        },
        error: (err) => config.logger.exit(err)
      });
    }
  )

  .command(
    `tags`,
    "see project tags",
    (argv) => {
      Config.addPnaOption(argv);
      Config.addQuantityOption(argv);
    },
    (args) => {
      const config = new Config(args);
      const quantity = config.getQuantity();
      const gitlabService = config.createService();
      const projectName = config.getPna();
      const tags$ = gitlabService.getTags(projectName, quantity);
      tags$.subscribe({
        next: (tags) => tags.forEach((t) => config.logger.printItem(t.toString())),
        error: (err) => config.logger.exit(err)
      });
    }
  )

  .conflicts("token", "auto-token")
  .conflicts("url", "auto-url")
  .strict()
  .help()
  .version()
  .demandCommand()
  .recommendCommands()
  .showHelpOnFail(true)
  .epilogue(`For more information, check out the documentation at https://github.com/andreclinio/gitlab-cli`)
  .argv;
