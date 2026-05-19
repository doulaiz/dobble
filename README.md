# Dobble Card Generator

A web app for creating custom [Dobble](https://en.wikipedia.org/wiki/Dobble) (a.k.a. Spot It!) card decks with your own images.

Dobble is a card game where every pair of cards shares **exactly one** matching symbol. This app generates the correct card layout then lets you export the result for printing.

## How it works

1. **Choose a game mode** — 4, 6, or 8 images per card, yielding decks of 13, 31, or 57 cards respectively
2. **Upload your images** — provide one image per slot; images can be cropped and rotated in-app
3. **Generate cards** — the app computes the unique image distribution guaranteeing one match per card pair
4. **Preview & arrange** — inspect every card and drag image to reposition them before exporting
5. **Export** — download a ZIP of print-ready PNG files, one per card

Your work is automatically saved in the browser so you can pick up where you left off.

## Running locally

```bash
npm install
npm start
```

Then open `http://localhost:4200/`.

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deploy to GitHub Pages

The app is hosted at [https://doulaiz.github.io/dobble/](https://doulaiz.github.io/dobble/).

### Deploying

```bash
npm run deploy
```

Builds the app for production and pushes the output to the `gh-pages` branch. Should be available after a couple of minutes

## Tech stack

- [Angular](https://angular.io/) 21
- [ngx-image-cropper](https://github.com/Mawi137/ngx-image-cropper) for in-browser image editing
- localStorage for session persistence
