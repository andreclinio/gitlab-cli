
# For End-Users

## Install with SNAP (mostly for Linux users)

The first easiest option is SNAP, 
Try the `snap` command to install or to update the program.
```
$ sudo snap install gitlab-cli --edge --devmode
$ sudo snap refresh gitlab-cli --edge --devmode
```

## Install with NPM (once you have NodeJs installed)
If you have NodeJs (https://nodejs.org) installed, 
a good option is NPM. Try the `npm` install command to install or to update the program.
```
$ npm i -g @andreclinio/gitlab-cli
```

## Usage (Fast Instructions)

Use `--help` option for instructions.
```
$ gitlab-cli --help
```

A brief example to see your projects:
```
$ gitlab-cli --token XXXXX --url https://gitlab.mycompany.com projects
 - [id:1] : projectA - group1/projectA
 - [id:2] : projectB - group2/projectB

```

## Configuration (Optional)

You can create the file `.gitlab-cli` (in the current directory) or a
`$HOME/.gitlab-cli` (in your home directory) to store the GitLab URL and your personel token. 
Once configured this way, you can use the options 
`--auto-token` and/or `--auto-url` avoid exposing sensitive data in command line.

The file should follow the JSON syntax:
```
{
    "token": "yadayadayada",
    "url": "https://gitlab.mycompany.com"
}
```

Example:
```
$ gitlab-cli --auto-token --auto-url projects --n 2
 - [id:1] : projectA - group1/projectA
 - [id:2] : projectB - group2/projectB
```

*Tip*: Do not grant read access for this file (`.gitlab-cli`) to other users...

# For Developers

## Start Playing...
```
$ git clone https://github.com/andreclinio/gitlab-cli
$ cd gitlab-cli
$ npm i
$ npx tsc && node build/main.js --help
```


## Examples (DEV mode)
```
$ npx tsc && node build/main.js --help
$ npx tsc && node build/main.js --token XXXXX --url https://git.tecgraf.puc-rio.br opened-issues --verbose --project-name my-project
$ npx tsc && node build/main.js release-notes --token XXXXX --url https://git.tecgraf.puc-rio.br --project-name my-project --verbose --milestone-name my-milestone
```

## Snap Publish
```
$ snapcraft login
$ snapcraft upload gitlab-cli_<version>_<arch>.snap
$ snapcraft status gitlab-cli
$ snapcraft list-revisions gitlab-cli
```
