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
```

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
