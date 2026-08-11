# Operation know-how in Claude Code web environment

The author has mainly tested the **Claude Code Web version** (see "Supported Platforms" in [README.md](../../README.md)). We will summarize the limitations and pitfalls specific to the web version and their workarounds. You can skip it in the CLI version or other AI coding agent environments.

## 1. About GitHub authentication

If you set a GitHub token (`GH_TOKEN`, etc.) in the ``Environment variables'' of Claude Code Web's session creation screen, it will be automatically available when the session starts. `gh auth login` is not required.

### Be careful of false positives of `gh auth status`

**In the Claude Code web environment, outbound communication is via a proxy, and GitHub's GraphQL API
Direct access to some repository operation endpoints of the REST API may be blocked (errors such as `GraphQL proxying is not enabled`). Since `gh auth status` and `gh issue list` use GraphQL internally, they may incorrectly display "token invalid" even if the token itself is valid. **Do not judge that the token is invalid just by looking at this display.

If you want to check the validity of the token itself, use a lightweight REST API endpoint that does not use GraphQL:

```bash
curl -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user
```

### We recommend using GitHub MCP server tools

In environments where the GitHub MCP server (`mcp__github__*` tools) is available, consider this before the `gh` CLI. Less susceptible to proxy restrictions and can be used as an alternative for authentication confirmation, issue list acquisition, etc.:

```bash
# Authentication confirmation: Use a tool equivalent to mcp__github__get_me instead of gh auth status
# Check the issue list: Use a tool equivalent to mcp__github__list_issues instead of gh issue list --json
```

### `gh` Known limitations of the CLI itself

`gh issue view --json subIssues` may not be supported depending on the environment (`Unknown JSON field: "subIssues"`). To retrieve subissues, switch to a method equivalent to GitHub MCP's `get_sub_issues` or directly to the GitHub REST/GraphQL API.

## 2. Regarding authentication and communication confirmation of the deployment destination environment (when using Vercel etc.)

The SoloXP workflow itself does not depend on the presence or absence of a deployment destination, but when operating in a project that involves deployment, such as a web application, `xp_RunE2ETests` and `xp_RunTestSuites` are often tested not only on the local server but also on a branch preview environment. Vercel will be used as an example below, but the concept is the same for other PaaS.

### Token settings

By setting the API token of the deployment destination (`VERCEL_TOKEN` for Vercel) in the Claude Code Web session creation screen ``Environment variables'', you can obtain the deployment status and preview URL via the API.

```bash
# Example of authentication confirmation (Vercel)
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v2/user" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user',{}).get('name'))"
```

### URL derivation of branch preview environment

For Claude Code Web tasks, a dedicated branch is automatically generated when the task is started, and the deployment destination often automatically generates a preview environment when it is pushed. The preview URL does not use the branch name as is, but is often truncated and hashed on the service side, so it is best to obtain it using the API rather than predicting it manually.**

```bash
# Example (Vercel): Get preview URL from branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=<project ID>&limit=20" \
  | python3 -c "
import sys, json
deps = json.load(sys.stdin)['deployments']
branch = '$BRANCH'
for d in deps:
    if d['meta'].get('githubCommitRef') == branch:
        print('https://' + d['url'])
        break
"
```

Replace `<project ID>` with the ID of your deployment destination project.

### Communication confirmation procedure (must be performed before executing E2E test)

If you run a test before the deployment is complete, the test target itself does not exist and it will fail. After obtaining the preview URL, check communication with the HTTP status before proceeding with the test:

```bash
PREVIEW_URL="<URL obtained above>"
echo "Preview URL: $PREVIEW_URL"
curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL"
```

If communication cannot be established, the deployment may not have been completed, so either wait or leave a comment to that effect on the issue. It is a good idea to transcribe the contents of this section as the actual commands for your project in the "Operation check/preview environment (project specific/edited)" section of [`CLAUDE.md.template`](../../CLAUDE.md.template).

## 3. Things to check when starting work

- Check if GitHub authentication is enabled (using the method in section 1. Don't just accept the `gh auth status` display)
- Check for open issues before starting work

## 4. Browser automation/proxy constraints

Claude Code Web uses a proxy for outbound communication, so when creating a new automation skill that launches a browser using Playwright etc., you may encounter proxy-related errors such as `net::ERR_CONNECTION_CLOSED`. General workaround:

- Check if the browser automation tool reads the proxy settings (`HTTP_PROXY`/`HTTPS_PROXY`)
- For proxies that do SSL/TLS inspection, you may need an option to ignore certificate errors.
  (Setting names vary depending on the tool. Example: "Ignore HTTPS errors" flag)
- Sandbox-related browser startup options (such as `--no-sandbox`) may be required.

The specific settings will vary depending on the browser automation tool and execution environment, so use the above as a starting point and adjust while checking communication in your own environment.

## 5. Synchronization when skill files are stored in multiple locations

If you plan to place the SoloXP skill definition (`skills/xp_*/SKILL.md`) in both the project scope (`.claude/skills/`) and the personal scope (`~/.claude/skills/`), or if you plan to use it in multiple repositories, etc., set up an operation where there are multiple locations. If you enable manual editing in both directions, accidents can easily occur, such as ``you won't know which one is the latest,'' or ``only one side will be updated and the functionality will conflict.''

Synchronization can be implemented in any way (copy script, git hook, symbolic link, etc.). When using symbolic links, be aware that if you combine this with the operation of exporting files over the history to another repository using `git subtree`, etc., the string itself, rather than the actual link destination, will be carried and the link will become broken (see also the note on ``When using symbolic links'' in the [Installation Manual](./install.md)).

## Related documents

- [Installation manual](./install.md)
- [Setup manual](./setup.md)
- [How to use tutorial](./tutorial.md)
