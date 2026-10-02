# Notes tool (local)

Turns the `notes/` folder into the published site. Runs only on your machine; the scripts are kept in the repo as a backup.

## Day to day (no command line)
- **Add a note:** make a new `.md` file in `notes/` (or use Obsidian pointed at that folder).
- **Add a document:** drop a `.pdf` into `notes/`.
- **Publish:** double-click **Publish Notes** on your Desktop. The site updates in about a minute.

## What the scripts do
- `build-notes.js` — renders every `notes/*.md` into a styled page and rebuilds the index (`notes/data.js`). Needs the `marked` dependency (`npm install`).
- `publish.cmd` — runs the build, then commits and pushes. The "Publish Notes" shortcut points here.

Front-matter (between `---` lines) is optional: `title`, `date` (YYYY-MM-DD), `tags: [a, b]`.
Without it, the first `# heading` is the title. Files starting with `_`, and READMEs, are ignored.
