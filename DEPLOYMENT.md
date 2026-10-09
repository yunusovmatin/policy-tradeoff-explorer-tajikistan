# Publishing and deployment verification

This guide publishes the reviewed application without altering its analytical engine. Repository destination: [yunusovmatin/policy-tradeoff-explorer-tajikistan](https://github.com/yunusovmatin/policy-tradeoff-explorer-tajikistan). No live URL has been verified yet. The local preview is not a deployment.

## 1. Publish the prepared Git repository

The project folder is a Git repository on main after the publication handoff. Review the clean commit with:

```sh
git status --short
git rev-parse HEAD
```

The public repository above has been created. Use that destination for Project 3. If publishing a separate copy, create an empty repository without an additional README, license or .gitignore and copy its HTTPS clone URL.

From this project's folder, check `git remote -v`. If origin is absent, add the correct URL; if it is already configured, skip the remote-add command and push:

```sh
git remote add origin https://github.com/YOUR_USERNAME/policy-tradeoff-explorer-tajikistan.git
git push -u origin main
```

Replace YOUR_USERNAME with the chosen GitHub account; the URL is an instruction template, not a claim that the repository exists. Complete the GitHub sign-in requested by Git Credential Manager, or use GitHub Desktop to add this local repository and publish it. Never paste tokens into source files or commands stored in the repository.

Verify that GitHub's latest commit SHA equals `git rev-parse HEAD`. Only the prepared tracked files belong in the repository. Private metadata, handoff/review records, chat shortcuts, earlier ZIP archives and generated output are ignored. The inherited browser debug collector was moved out of the project and must not be restored. Dormant template components remain unmounted.

Official instructions: [create a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository).

## 2. Deploy the static application

A Netlify configuration is included. Link the GitHub repository on its main branch to a new Netlify project, or link it to the intended existing project once access is established. Confirm:

| Setting | Exact value |
| --- | --- |
| Base directory | Repository root; leave blank |
| Node.js | 24.14.0 |
| pnpm | 10.4.1, as declared in package.json |
| Dependency installation | Frozen pnpm-lock.yaml; dev dependencies included |
| Build command | pnpm run check && pnpm exec vitest run && pnpm run build && node scripts/prepare-release.mjs |
| Publish directory | dist/public |
| Runtime secrets | None |

The build gates type checks and all 30 tests before deployment. Do not set NODE_ENV=production during dependency installation because the build tools are dev dependencies. Existing netlify.toml provides the static SPA fallback; root `/` mounts Explorer and the application retains its existing 404 behavior. No authentication, databases, serverless functions or AI service is required.

For a manual upload without Git-linked hosting:

```sh
npx --yes pnpm@10.4.1 install --frozen-lockfile
npx --yes pnpm@10.4.1 run check
npx --yes pnpm@10.4.1 exec vitest run
npx --yes pnpm@10.4.1 run build
node scripts/prepare-release.mjs
```

Upload only the contents of dist/public to the intended static host, or extract the supplied static-deployment ZIP and upload its folder. The publication ZIP contains source and is not itself the website output. Keep asset filenames unchanged and disable host transformations of HTML/JS/CSS if using exact hash verification. Use the same intended host and domain when replacing an older deployment.

Official references: [Netlify build/publish settings](https://docs.netlify.com/build/configure-builds/overview/) and [dependency versions](https://docs.netlify.com/build/configure-builds/manage-dependencies/).

## 3. Confirm deployment identity and behavior

The build-only release.json contains the committed source SHA, a source-tree digest and SHA-256 hashes of deployed static files. It is publication metadata; the app does not fetch it. Check `https://YOUR_LIVE_HOST/release.json` and compare its commit with `git rev-parse HEAD`. Compare the downloaded index.html and hashed JS/CSS against those listed in the manifest. A matching manifest alone is not proof that every asset was deployed correctly. Use the deployment's own commit/version record where available, and inspect the browser after clearing old cache.

Verify the following live, not solely against screenshots:

1. All six sections exist: Context, Assumptions, Options, Results, Sensitivity, Notes & Exports. Subtitle is exactly “Illustrative internal logic prototype.”
2. Inputs remain banded; prices are independent of demand/remittance conditions; Assessment Horizon differs from Typical Package Lag.
3. Resilience focus, low capacity, medium horizon, Base conversion, baseline macro and Medium adaptation yield C → B → A under the declared categorical robustness rule.
4. Employment focus, medium capacity, severe constraints retain A as the supported second analytical option. Severe/low capacity produces no eligible option. Rejection reasons, conditions, risks and confidence remain visible.
5. Sensitivity shows pathway/delivery changes even where ordering stays unchanged.
6. Record a pre-feasibility scenario, change assumptions, return to Notes, and inspect differing categories. A constraint-only change does not affect that comparison. Reload clears the record.
7. Download the CSV. It has four columns and contains only the current scenario; underlying illustrative values and the negative-use disclaimer remain. Compare displayed values against export rows.
8. At about 390px, six tabs are accessible, sensitivity cards stack, tables scroll inside their containers, and the page has no horizontal overflow. Zoom and keyboard focus remain available.
9. No inherited startup branding, login flow, data fetching, persistent scenarios, model inference, feedback feature or double arrows are active. The sole AI acknowledgment remains the approved methodological sentence.

After verifying a public deployment, add its literal URL to README.md, commit the documentation update and redeploy that commit. Report the new commit SHA and host deployment version; do not reuse the previous SHA for a different published commit.

## Credential cleanup

Inherited hosting metadata contained credentials and was moved to the separate local private-development folder. Earlier review ZIPs also contained that metadata. Do not share those ZIPs or the private folder; use the sanitized publication package. Revoke or rotate any still-valid inherited credentials through their original provider. No inherited credential is necessary for this static application. No live credential was used for publication in this pass.
