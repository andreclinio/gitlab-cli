
# For End-Users

This section is for people who just want to install the program.
If you want more information, check developers issues at the DEV section below.

## Install with SNAP (mostly for Linux users)

The first easiest option is SNAP.
Try the `snap` command to install or to update the program.

``` bash
sudo snap install gitlab-cli --edge --devmode
sudo snap refresh gitlab-cli --edge --devmode
```

## Install with NPM (once you have NodeJs installed)

If you have [NodeJs](https://nodejs.org) installed,
a good option is NPM. Try the `npm` command to install or to update the program.

``` bash
npm i -g @andreclinio/gitlab-cli
```

## Usage (Fast Instructions)

Use `--help` option for instructions.

``` bash
$ gitlab-cli --help
...
```

A brief example to see your projects:

```bash
$ gitlab-cli --token XXXXX --url https://gitlab.mycompany.com projects
 - [id:1] : projectA - group1/projectA
 - [id:2] : projectB - group2/projectB

```

**Tip**: The personel token can set previosly inside Gitlab -- see [docs](https://docs.gitlab.com/ee/user/profile/)personal_access_tokens.html for details

## Configuration (Optional)

You can create the file `gitlab-cli.cfg` (in the current directory) or a
`$HOME/gitlab-cli.cfg` (in your home directory) to store the GitLab URL and your personel token.
Once configured this way, you can use the options
`--auto-token` and/or `--auto-url` (or just simply `--auto-all`) to avoid exposing sensitive data in command line.

The file should follow the JSON syntax:

```json
{
    "token": "yadayadayada",
    "url": "https://gitlab.mycompany.com"
}
```

Example:

``` bash
$ gitlab-cli --auto-token --auto-url projects -n 2
- [id:1] : projectA - group1/projectA
- [id:2] : projectB - group2/projectB

$ gitlab-cli --auto-all issues -n 10 --pna projectA --opened
- [issue-1231] Yada yada
- [issue-1232] Yada yada yada

```

**Tip**: Do not grant read access for file (`gitlab-cli.cfg`) to other users...

# For Developers

## Start Playing

```bash
git clone https://github.com/andreclinio/gitlab-cli
cd gitlab-cli
npm i
npx tsc && node build/main.js --help
```

## Examples (DEV mode)

```bash
npx tsc && node build/main.js --help
npx tsc && node build/main.js --token XXXXX --url https://mygit.mycompany.com issues --opened --verbose --project-name my-project
npx tsc && node build/main.js release-notes --token XXXXX --url https://mygit.mycompany.com --project-name my-project --verbose --milestone-name my-milestone
```

## Tag (version) Generation

See `package.json` scripts for details.

### Normal stable version

``` bash
npm run release
```

### Beta release

```bash
npm run release-beta
```

## Snap Publish

The `npm` command below is used only to remove snap files and rebuild the project.
See the `package.json` file.

```bash
npm run snapcraft
 
snapcraft login
snapcraft upload gitlab-cli_<version>_<arch>.snap
snapcraft status gitlab-cli
snapcraft list-revisions gitlab-cli

rm -fr *.snap
```

## NPM Publish

The `npm login` command below is needed only at first time.
First, move to a valid tag (`git checkout`) and perform the folloeing commands:

```bash
npm login
npm publish --access public
npm publish --tag beta --access public
```

Installing a beta version:

```bash
npm i @andreclinio/gitlab-cli@0.5.1-beta.1 --global
```
