# David Comment API on Deno Deploy

This is the anonymous comment backend for `crystaldavid.github.io`.

## Deno Deploy settings

- GitHub repository: `CrystalDavid/CrystalDavid.github.io`
- Branch: `main`
- App directory: root directory
- Entry point: `comment-api-deno/main.ts`
- Install command: empty
- Build command: empty

## Environment variables

```text
ALLOWED_ORIGIN=https://crystaldavid.github.io
GITHUB_TOKEN=your_fine_grained_github_token
GITHUB_OWNER=CrystalDavid
GITHUB_REPO=CrystalDavid.github.io
ADMIN_PASSWORD_HASH=da3fb9830dbd1b3ee2e799a06b3d8b486e5285fc508264f87777905827510551
```

`GITHUB_TOKEN` is used only on the Deno server side for admin actions such as deleting articles or updating article metadata. Do not expose it in browser code.

## Test endpoints

```text
GET https://your-app.deno.dev/health
GET https://your-app.deno.dev/comments?page=/about/
POST https://your-app.deno.dev/comments
```

POST body:

```json
{
  "page": "/about/",
  "nickname": "David",
  "content": "Hello"
}
```
