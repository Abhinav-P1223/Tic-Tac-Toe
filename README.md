# Challenge Abhinav — Tic-Tac-Toe

A cyber space punk Tic-Tac-Toe game. You play X; Abhinav is the O machine, using minimax with alpha-beta pruning. Anyone who opens the hosted site can challenge Abhinav in their browser.

## Deploy to Netlify from this ZIP

1. Extract the ZIP.
2. Open the extracted project and drag its `out` folder into [Netlify Drop](https://app.netlify.com/drop).
3. Netlify publishes the ready-to-play static site and gives you a public URL to share.

The ZIP includes both the source code and the prebuilt `out` folder. To rebuild after changing the source, run:

```bash
npm install
npm run build
```

The build clears any stale or read-only `out` export before generating a fresh one, which also avoids permission errors on cached Netlify builds.

Then upload the refreshed `out` folder.

## Deploy from GitHub

Import the repository in Netlify. The included `netlify.toml` sets the build command to `npm run build` and publish directory to `out`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
