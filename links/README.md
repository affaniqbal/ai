# Links

One Markdown file per link. This folder is the source of truth — plain files you own.

## Add a link
- **By hand:** copy `_template.md` to `links/my-slug.md` and fill it in.
- **Helper:** `node tool/add-link.js "https://the-url"` — fetches the title and creates the file for you; then edit the notes.

Front-matter fields: `title`, `url`, `tags: [a, b]`, `status` (e.g. reviewed / to-read), `date` (YYYY-MM-DD). Notes go below the second `---`, in Markdown.

## Publish
```
node tool/build-links.js     # regenerates links/data.js from the .md files
git add links && git commit -m "links" && git push
```

## Remove a link
Delete its `.md` file and re-run `node tool/build-links.js`.
(Files whose names start with `_`, and this README, are ignored by the build.)
