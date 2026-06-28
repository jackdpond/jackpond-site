## Target project structure

```
my-site/
│
├── _quarto.yml              # Site-wide config: title, navbar, theme, footer
├── index.qmd                # Homepage
├── writing.qmd              # Writing listing page (auto-aggregates posts)
├── projects.qmd             # Projects page
│
├── posts/                   # All writing lives here
│   ├── 2025-06-01-my-first-essay/
│   │   ├── index.qmd        # The post itself
│   │   └── image.png        # Post-local assets
│   ├── 2025-06-15-some-math/
│   │   ├── index.qmd
│   │   └── diagram.svg
│   └── ...
│
├── projects/                # One file per project, or a single qmd with cards
│   └── projects.qmd         # Can also just be the top-level projects.qmd
│
├── assets/
│   ├── styles.css           # Custom CSS overrides
│   └── js/
│       └── custom.js        # Any bespoke JS (e.g. distill-style citations)
│
├── images/
│   └── profile.jpg          # Homepage photo and other shared images
│
└── .gitignore
```

---

## _quarto.yml

This is the most important file. It controls everything site-wide.

```yaml
project:
  type: website
  output-dir: _site          # rendered output goes here (add to .gitignore)

website:
  title: "Your Name"
  navbar:
    left:
      - href: index.qmd
        text: Home
      - href: writing.qmd
        text: Writing
      - href: projects.qmd
        text: Projects
  favicon: images/favicon.ico
  page-footer:
    center: "© 2025 Your Name"

format:
  html:
    theme: 
      - cosmo                # base Quarto theme; swap or layer your own
      - assets/styles.css    # your overrides always go second
    code-copy: true
    toc: true                # table of contents on long posts
    toc-depth: 3
    citations-hover: true    # footnote/citation hover popups
    link-external-newwindow: true
```

---

## index.qmd (Homepage)

```yaml
---
title: ""                    # suppress default title; you'll write your own
page-layout: full            # no sidebar, full width
---
```

Write this as a short personal landing page:
- Photo (use CSS to position it)
- 1–2 paragraph bio
- "What I'm working on now" section (update this occasionally)
- Links to Writing and Projects

---

## writing.qmd (Listing page)

Quarto's listing feature auto-aggregates all posts in `posts/` — 
no manual updating required when you add a new post.

```yaml
---
title: "Writing"
listing:
  contents: posts
  sort: "date desc"
  type: default              # options: default | grid | table
  categories: true           # renders your tags as filterable categories
  feed: true                 # generates an RSS feed automatically
---
```

That's it. Quarto handles the rest.

---

## Individual post frontmatter (posts/2025-06-01-my-first-essay/index.qmd)

```yaml
---
title: "Your Post Title"
date: 2025-06-01
description: "One sentence shown in the listing and in link previews."
categories: [essay]          # your tags: essay, math, explainer, research
image: image.png             # thumbnail shown in the listing grid
bibliography: refs.bib       # drop a .bib file here for academic posts
---
```

Then write in Markdown below the frontmatter. LaTeX math works 
out of the box: inline `$x^2$` or display `$$\int_0^\infty$$`.

---

## projects.qmd

Two reasonable approaches:

**Option 1:** Write it by hand as a simple Markdown page with cards 
you style via CSS. Most control, least automation.

**Option 2:** Use Quarto's listing system the same way as writing.qmd, 
with a `projects/` folder where each project is a `.qmd` file with 
frontmatter for title, description, tech stack, and repo link.

Start with Option 1. It's simpler and projects don't need 
date-sorted automation the way blog posts do.

---

## Deployment (GitHub Pages)

```yaml
# Add to _quarto.yml under project:
  resources:
    - .nojekyll              # tells GitHub Pages not to process with Jekyll
```

```bash
# Render the site
quarto render

# Push _site/ to the gh-pages branch, or use quarto publish:
quarto publish gh-pages
```

`quarto publish gh-pages` handles everything — renders, creates the 
branch, pushes. Run it once and subsequent pushes auto-deploy.

If you have a custom domain, add a `CNAME` file to the root 
containing just your domain name, e.g. `yourname.com`.

---

## Adding custom JS

Per-post: add a `include-after-body` key in the post's frontmatter
pointing to a `.html` file with your `<script>` tags.

Site-wide: add to `_quarto.yml` under `format: html:`:
```yaml
    include-after-body: assets/js/custom.js
```

Observable JS (reactive, notebook-style): write directly in 
code chunks with `{ojs}` instead of `{python}` — no setup needed.

---

## .gitignore

```
/_site
/.quarto
```