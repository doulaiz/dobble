# Dobble Card Generator

A web app for creating custom [Dobble](https://en.wikipedia.org/wiki/Dobble) (a.k.a. Spot It!) card decks with your own images.

Dobble is a card game where every pair of cards shares **exactly one** matching symbol. This app generates the mathematically correct card layouts using a [projective plane](https://en.wikipedia.org/wiki/Projective_plane) construction, then lets you export the result for printing.

## How it works

1. **Choose a game mode** — 4, 6, or 8 symbols per card, yielding decks of 13, 31, or 57 cards respectively
2. **Upload your symbols** — provide one image per symbol slot; images can be cropped and rotated in-app
3. **Generate cards** — the app computes the unique symbol distribution guaranteeing one match per card pair
4. **Preview & arrange** — inspect every card and tweak image positions before exporting
5. **Export** — print-ready PDF export (in progress)

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

## Tech stack

- [Angular](https://angular.io/) 21
- [ngx-image-cropper](https://github.com/Mawi137/ngx-image-cropper) for in-browser image editing
- localStorage for session persistence
