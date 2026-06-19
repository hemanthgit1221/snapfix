# Public mirror playbook — SnapFix

How we built the **SnapFix** GitHub README, filtered a **public portfolio copy** (~35% of files omitted), and push it to a second GitHub account — without giving away enough code to clone or run the product.

Use this document to replicate the same pattern on other projects.

---

## Goals

| Goal | Approach |
|------|----------|
| **Private / full repo** | Normal `git push` to `origin` (e.g. `DarkKnight29/snapfix_final`) — everything stays |
| **Public / portfolio repo** | Run `.\scripts\push-hemanth.ps1` → force-pushes a **filtered snapshot** to `hemanth` (e.g. `hemanthgit1221/snapfix`) |
| **Showcase the product** | Rich README + screenshots + architecture diagram |
| **Prevent full copy** | Omit backend, deploy scripts, most app source, internal docs |
| **Look credible** | Keep one sample file per major folder + one intact feature module (rewards) |
| **Clean public metadata** | Single **orphan** commit, no `Co-authored-by: Cursor`, author = public account |

---

## Architecture: two remotes, one local repo

```
┌─────────────────────────────────────────────────────────────┐
│  Local machine (full working tree)                          │
│  branch: main                                               │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ git push origin main         │ .\scripts\push-hemanth.ps1
               ▼                              ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│  origin                  │    │  hemanth                     │
│  DarkKnight29/snapfix_final│  │  hemanthgit1221/snapfix      │
│  • 100% of tracked files │    │  • ~65% of files (filtered)  │
│  • full git history      │    │  • 1 orphan commit only      │
│  • setup / run docs OK   │    │  • no How to Run section     │
└──────────────────────────┘    └──────────────────────────────┘
```

**Important:** Git has **one** `.gitignore` per repo. The mirror is a **separate publish step**, not a second branch you merge normally.

---

## Part 1 — Public README

The root `README.md` is portfolio-facing only:

- Hero block, overview, layout table, tech stack
- Mermaid architecture diagram
- Feature bullets (tickets, RBAC, rewards)
- Screenshots under `docs/screenshots/`
- **No** clone / install / Docker / env instructions

Setup and run docs live in excluded files on `origin` only: `QUICK_START.md`, `README-DOCKER.md`, `deployment/`, etc.

---

## Part 2 — Local-only ignores

In `.gitignore`:

```gitignore
.cursor
.cursor/
**/.cursor/
.hemanth-mirror-worktree/
```

Also add `.cursor/` to `deployment/hemanth-exclude.txt`.

---

## Part 3 — Exclude and keep lists

| File | Purpose |
|------|---------|
| `deployment/hemanth-exclude.txt` | Paths **dropped** from the public mirror |
| `deployment/hemanth-keep.txt` | Paths **restored** even if matched by an exclude rule |

**Omit:** `backend/`, `deployment/`, `scripts/`, `database/`, `db-dashboard/`, most of `frontend/`, internal docs, deploy/test scripts, `user_login/`.

**Keep:** `README.md`, `docs/screenshots/`, rewards module (API + UI), one sample file per layer.

---

## Part 4 — Push script

```powershell
.\scripts\push-hemanth.ps1
```

What it does:

1. Read exclude/keep lists  
2. Create worktree at `.hemanth-mirror-worktree/` from `main`  
3. `git rm` excluded paths (unless kept)  
4. Orphan commit with author `hemanthgit1221@users.noreply.github.com`  
5. `git push --force hemanth hemanth-mirror-root:main`  
6. Clean up worktree  

Preview without pushing:

```powershell
.\scripts\push-hemanth.ps1 -WhatIf
```

---

## Part 5 — One-time GitHub setup

```powershell
# Log in as public account
gh auth login

# Add second remote (keep origin unchanged)
git remote add hemanth https://github.com/hemanthgit1221/snapfix.git

# Create empty public repo (if needed)
gh repo create hemanthgit1221/snapfix --public --description "College issue reporting & maintenance platform (portfolio snapshot)"

gh auth setup-git
```

If push fails on workflows scope:

```powershell
gh auth refresh -h github.com -s workflow
```

---

## Part 6 — Day-to-day workflow

### Private development

```powershell
git add .
git commit -m "feat: ..."
git push origin main
```

Use `DarkKnight29` credentials for `origin`. Switch `gh auth login` if needed.

### Publish public mirror

```powershell
.\scripts\push-hemanth.ps1
```

Verify:

```powershell
git fetch hemanth
git log hemanth/main -1 --oneline
gh repo view hemanthgit1221/snapfix
```

---

## Part 7 — SnapFix-specific summary

### Public repo shows

- Portfolio README with architecture and features  
- `docs/screenshots/` branding assets  
- Rewards module snippets (controller, service, React screens)  
- Sample entry points (`SnapFixBackendApplication.java`, `Login.tsx`)  

### Public repo hides

- Full backend, deployment, database schema, Docker compose  
- Almost all frontend services and build configs  
- How to Run docs, env templates, Cursor plans  
- Full git history  

### Commands

```powershell
git push origin main
.\scripts\push-hemanth.ps1
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Repository not found` | `gh auth login` as `hemanthgit1221` for `hemanth` remote |
| `workflow scope` error | `gh auth refresh -h github.com -s workflow` |
| Mirror missing README changes | Commit on `main` first, then re-run push script |
| `push-hemanth.ps1` not on public repo | Expected — `scripts/` and `deployment/` are excluded |

---

## File reference (private origin only)

```
SnapFix_mark2/
├── README.md                      # Portfolio readme (mirrored)
├── docs/screenshots/              # Kept on mirror
├── .gitignore                     # .cursor + mirror worktree
├── deployment/
│   ├── hemanth-exclude.txt
│   ├── hemanth-keep.txt
│   └── PUBLIC_MIRROR_PLAYBOOK.md  # This document
└── scripts/
    └── push-hemanth.ps1
```
