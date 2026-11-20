# معاً من أجل تقرت — touggourt-vercel-site

Static single-page site deployed on Vercel as project `touggourt-vercel-site`
(https://touggourt-vercel-site.vercel.app).

- `index.html` — the whole page (HTML, CSS, JS and images embedded as base64).
- `api/submit.js` — serverless function that receives the citizen suggestion form (`POST /api/submit`).

This repo mirrors what is deployed in production. The Vercel project is still
linked to a different GitHub repo (`touggourt-volunteer-clone`), so pushing here
does not deploy anything by itself.

## Citizen registration page
`citizens/` — صفحة تسجيل المواطنين لأعوان الإدارة (`/citizens/`)، مع مؤشر أهمية بأربع درجات وحفظ في Google Sheet عبر `citizens/apps-script/Code.gs`. التعليمات في `citizens/README.md`.
