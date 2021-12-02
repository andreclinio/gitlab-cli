
# For End-Users

## Configuration (Optional)

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
$ gitlab-cli --auto-token --auto-url projects --n 2
 - [id:1] : projectA - group1/projectA
 - [id:2] : projectB - group2/projectB
```


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