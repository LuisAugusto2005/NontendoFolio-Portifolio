# NontendoFolio-Portifolio

A Nintendo Wii / Wii U / 3DS inspired portfolio with a Frutiger Aero look, starring a 3D Mii (`public/models/MyCoolMii.glb`).
Available in **Português**, **English** and **日本語**.

## What's inside

- **Boot screen** in the style of the Wii "Health & Safety" warning, with language and sound options. Press A, Enter or click to continue.
- **Wii-menu channel grid** with animated channel art. Selecting a channel zooms it full screen like the console, with *Menu* / *Start* buttons. *Start* morphs the banner into the page header.
- **Your 3D Mii as the host.** It walks in and waves, follows the cursor with its head, explains each channel when you hover it, reacts when clicked, fidgets, and plays the 3DS (with glowing screens) if you leave it alone for a while. All animation is procedural: idle, walk cycle, gestures, look-at, and two-bone arm IK.
- **Channels:** About Me (drag-to-spin Mii turntable and Mii card), Projects (game cases on a shelf; a disc slides out when you open one), Skills (meters and badges), Journey (message-board timeline), Contact (a letter that folds and flies away, plus a friend list), CV Shop (Wii-Shop-style block download) and Settings.
- **3DS-style status bar** and **Wii-style bottom bar** with the clock and date.
- **Wii-remote hand pointer**, glossy poppable bubbles, synthesized sound effects and an original lounge BGM, all generated with Web Audio (no audio files).
- Responsive: side by side on desktop, stacked like a 3DS (top screen + touch screen) on phones and portrait tablets.
- Keyboard friendly (arrow keys on the grid, `A`/`Enter` to start, `B`/`Esc` to go back), respects *reduced motion*, and deep links work (`#/projects`, `#/about`…).

## Make it yours

Everything personal lives in **`src/content.js`**: name, role, bio, Mii card, projects, skills, journey, links. Each text is either a plain string or `{ pt, en, ja }`.

- Entries marked `sample: true` are placeholders. Replace or delete them.
- Set `profile.email` to enable the contact letter (it opens the visitor's email app).
- Put your résumé at `public/cv.pdf` and set `profile.cvUrl: './cv.pdf'` to enable the CV Shop download.
- Add your LinkedIn URL in `friends`.
- UI strings for all three languages are in `src/i18n.js`.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview  # serve the build
```

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.
In the repository settings, open **Pages** and set **Source** to **GitHub Actions**.
The build uses relative paths, so it also works on any static host.

## Credits

Built with [three.js](https://threejs.org) and [Vite](https://vite.dev), with font M PLUS Rounded 1c.
The 3DS XL prop inside `MyCoolMii.glb` comes from a Sketchfab model. Credit its author and license here.
A fan project inspired by the Wii, Wii U and Nintendo 3DS. Not affiliated with or endorsed by Nintendo.
