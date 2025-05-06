_This document describes how the Spring Framework team manages Git branches and how changes are applied to multiple branches. For more details about the code conventions, check out the [[Code Style]] page._

## Git Branches

When looking at the Spring Framework repository, we can find several branches:

* the current branch - the branch of the current Framework generation, i.e. the latest generation with GA releases. This information is available on the [Spring Framework project page](https://spring.io/projects/spring-framework#learn)
* the Git `main` branch - this can be the current branch, or a branch dedicated to the next major/minor release
* maintenance branches - branches of Framework generations being actively maintained
* former maintenance branches of EOL'd versions, i.e. not maintained anymore

## Applying changes to the Spring Framework repository

For this example, we'll use the following as the hypothetical current state of the repository:

* the `main` branch is dedicated to an upcoming `6.1.0` minor version
* the current branch is `6.0.x`
* there is one active maintenance branch, `5.3.x`

Let's consider the issue `#1234`, which is the bug fix we're working on.

### Forward merges

First, we need to fix the bug and merge it forward if necessary. If the current branch is the main / default branch, pushing changes to the main branch is enough and there is no need for forward merges. This means that we need to target the fix to the appropriate milestone, in this case the next `6.0.x` release.

```bash
$ # checkout the maintenance branch and update it
$ git checkout 6.0.x && git pull
$ # work on a fix and commit it to the current branch
$ git add . && git commit
$ # push the changes to the current branch
$ git push origin 6.0.x
$ # checkout the main branch and update it
$ git checkout main && git pull
$ # merge the changes forward, resolving conflicts if necessary
$ git merge --no-ff 6.0.x
```

### Backports

If the fix is meant to be applied to other maintenance versions, you need to backport the commit to maintenance branches.
The Spring Framework team is using the [backport-bot](https://github.com/spring-io/backport-bot) for that.

Preferably, the first step is to trigger the bot to create a backport issue. This is done by applying a label `for: backport-to-{TARGET}` to the original issue or PR, where `{TARGET}` is the name of the maintenance branch. In our example, this is the `for: backport-to-5.3.x` label.

We can then cherry-pick the commit, optionally edit the cherry-pick commit message, and push it to the maintenance branch.

Let's assume the backport issue is `#3456`:

```bash
$ git checkout 6.0.x && git log
$ # the commit sha for the #1234 fix is c0ffee456
$ git checkout 5.3.x
$ git cherry-pick c0ffee456 --edit
$ # ideally add a reference to the backport issue and original issue in the cherry-pick commit message like so:
$ # See gh-1234
$ # Closes gh-3456
$ git push origin 5.3.x
```

Note that simply cherry-picking without the `--edit` and pushing a cherry-pick commit with the original `Closes gh-1234` mention in the message should still trigger the bot to close the backport issue.

Another option is to directly cherry-pick the original commit and push it to the maintenance branch, in which case the bot should automatically create and close the backport issue.

In the two later approaches, the drawback is that the backport issue wouldn't display a link to the commit in GitHub's UI so it would be up to you or a maintainer to make that explicit.
