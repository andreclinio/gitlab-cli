
## Start Playing...
```
$ npm i
$ npx tsc && node build/main.js --help
```

You can create a `$HOME/.gitlab-cli` file to store the URL and token. Then, you can use
then options `--auto-token` and/or `--auto-url` avoid exposing sensitive data in command line.

```
{
    "token": "yadayadayada",
    "url": "https://mygitlab.com"
}
```

Example:
```
$ npx tsc && node build/main.js --auto-token --auto-url projects
 - [id:1] : projectA - group1/projectA
 - [id:2] : projectB - group2/projectB
 ```

## Examples (DEV mode)
```
$ npx tsc && node build/main.js --help
$ npx tsc && node build/main.js --token XXXXX --url https://git.tecgraf.puc-rio.br opened-issues --verbose --project-id 1960
$ npx tsc && node build/main.js release-notes --token XXXXX --url https://git.tecgraf.puc-rio.br --project-id 1960  --verbose --mid 334
```