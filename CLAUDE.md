# The-Real-Middle

Interactive tool showing where a household sits in India's income distribution.
React, Vite, Recharts, Tailwind. Deployed on Netlify at therealmiddle.netlify.app.

## Commands

```bash
npm ci                 # not `npm install`, see below
npm run dev
npm run build          # vite build
```

## There was no lockfile until 2026-09-22

`package.json` carries `^` ranges on react 19, react-dom, recharts 3, vite 6,
tailwind 4 and `@vitejs/plugin-react`, and nothing recorded which versions
actually worked. CI ran `npm install`, so **every CI run and every Netlify
deploy resolved the tree afresh**: a build that passed yesterday could fail
today with no commit in between, and a compromised transitive release would land
with nothing to notice it.

`package-lock.json` is now committed and CI runs `npm ci`, which installs
exactly what the lockfile records and fails if the lockfile and `package.json`
disagree. When you add or bump a dependency, commit the updated lockfile with it.

Audited at the same time: **0 vulnerabilities**.

## Watch out for

- **The link check cannot fail.** `.github/workflows/ci.yml` runs
  `lycheeverse/lychee-action` with `fail: false`, so a dead external link is
  reported and the job stays green. That is a defensible choice for a third-party
  link crawl, since a link can rot with no commit behind it, but do not read a
  green CI as meaning the links are good. Read the step output.
- **The bundle is over 500 kB** and Vite says so on every build. Recharts is most
  of it. Not urgent for a single-page tool, but it is why the warning appears and
  it is not a new problem.
- **`src/App_BackUp.js` was deleted**, 534 lines against `App.jsx`'s 753. It was
  imported by nothing, so Vite never bundled it, but it read as a second copy of
  the application. It is in the git history if it is ever wanted.
