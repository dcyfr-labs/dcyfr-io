<!-- TLP:CLEAR -->
# dcyfr.io Deployment Runbook

## Overview

| Setting   | Value                                                               |
| --------- | ------------------------------------------------------------------- |
| Domain    | dcyfr.io                                                            |
| Hosting   | Vercel (SSG + Edge)                                                 |
| DNS       | Vercel-managed (Project → Settings → Domains)                       |
| SSL       | Vercel auto-managed (Let's Encrypt, auto-renewed)                   |
| WAF       | Vercel Web Application Firewall (enable in project settings)        |
| Analytics | Vercel Analytics + Speed Insights (enable in project settings)      |
| Errors    | Sentry project: `dcyfr-io`                                          |
| Repo      | `dcyfr-labs/dcyfr-io`                                                    |

## Branch → Environment Mapping

| Branch           | Environment | URL                                   |
| ---------------- | ----------- | ------------------------------------- |
| `main`           | Production  | <https://dcyfr.io>                    |
| Any other branch | Preview     | `https://dcyfr-io-<hash>.vercel.app`  |

Vercel auto-deploys on push. Production is gated to `main`.

## Required Environment Variables

Set in **Project Settings → Environment Variables**:

| Variable                 | Environments          | Description                     |
| ------------------------ | --------------------- | ------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN` | All                   | Sentry DSN for `dcyfr-io`       |
| `SENTRY_DSN`             | Production, Preview   | Server-side Sentry DSN          |
| `SENTRY_ORG`             | Production            | Sentry org slug (`dcyfr-labs`, the default in `next.config.ts`)       |
| `SENTRY_PROJECT`         | Production            | Sentry project (`dcyfr-io`)     |
| `SENTRY_AUTH_TOKEN`      | Production            | Source map upload at build time |

## Manual Deploy

```bash
npm i -g vercel   # install CLI once

vercel            # deploy preview
vercel --prod     # deploy production
```

## Rollback

```bash
vercel ls dcyfr-io
vercel promote <deployment-url> --prod
```

## Cache Invalidation

```bash
vercel --prod --force
```

Or via dashboard: **Deployments → Redeploy → Use existing build cache: off**

## Domain Management

All DNS/SSL is configured in the Vercel dashboard:

1. **Vercel Dashboard** → `dcyfr-io` project → **Settings** → **Domains**
2. Add `dcyfr.io` — Vercel provides the CNAME/A record for your registrar
3. SSL auto-issues within ~60 seconds of DNS propagation

## Post-Deploy Checklist

- [ ] `curl -I https://dcyfr.io` → 200 OK
- [ ] Sentry: no new errors in last 5 min
- [ ] Vercel Analytics: traffic flowing
- [ ] Product grid visible with all 7 TLD cards
