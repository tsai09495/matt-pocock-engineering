# HTML Report Format

The architectural review is rendered as one offline, self-contained HTML file in the OS temp directory. Use only inline CSS and inert HTML; no scripts, remote assets, fonts, network requests, event handlers, forms, or interactive URLs. HTML-escape every repository-derived value, including repo, module, file, glossary, and ADR text.

## Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:" />
    <title>Architecture review — {{repo name}}</title>
    <style>
      :root { color-scheme: light; font-family: ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; background: #fafaf9; color: #0f172a; }
      main { max-width: 64rem; margin: auto; padding: 3rem 1.5rem; }
      article { margin: 2rem 0; padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: .75rem; background: white; }
      .diagram { white-space: pre-wrap; padding: 1rem; border: 1px solid #e2e8f0; border-radius: .5rem; background: #f8fafc; }
      .seam { border-style: dashed; }
      .leak { color: #dc2626; }
      .deep { background: linear-gradient(135deg, #0f172a, #1e293b); }
    </style>
  </head>
  <body>
    <main>
      <header>...</header>
      <section id="candidates" class="space-y-10">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## Header

Repo name, date, and a compact legend: solid box = module, dashed line = seam, red arrow = leakage, thick dark box = deep module. No introduction paragraph — straight into the candidates.

## Candidate card

The diagrams carry the weight. Prose is sparse, plain, and uses the glossary terms ([LANGUAGE.md](LANGUAGE.md)) without ceremony.

Each candidate is one `<article>`:

- **Title** — short, names the deepening (e.g. "Collapse the Order intake pipeline").
- **Badge row** — recommendation strength (`Strong` = emerald, `Worth exploring` = amber, `Speculative` = slate), plus a tag for the dependency category (`in-process`, `local-substitutable`, `ports & adapters`, `mock`).
- **Files** — a small monospaced list.
- **Before / After diagram** — the centrepiece. Two columns, side by side. See patterns below.
- **Problem** — one sentence. What hurts.
- **Solution** — one sentence. What changes.
- **Wins** — bullets, ≤6 words each. e.g. "Tests hit one interface", "Pricing logic stops leaking", "Delete 4 shallow wrappers".
- **ADR callout** (if applicable) — one line in an amber-tinted box.

No paragraphs of explanation. If the diagram needs a paragraph to be understood, redraw the diagram.

## Diagram patterns

Pick the pattern that fits the candidate. Mix them. Don't make every diagram look the same — variety is part of the point.

### Static dependency map (the workhorse for dependencies / call flow)

Use an escaped `<pre class="diagram">` or nested boxes when the point is "X calls Y calls Z, and look at the mess." Text arrows work well for dependency and sequence comparisons. Keep visible labels separate from any structural identifiers and never paste repository text as markup.

```html
<div>
  <pre class="diagram">
    OrderHandler -&gt; OrderValidator -&gt; OrderRepo
                                      ..leaks..&gt; PricingClient
  </pre>
</div>
```

### Hand-built boxes-and-arrows (when Mermaid's layout fights you)

Modules as `<div>`s with borders and escaped labels. Use CSS borders and text arrows rather than script-driven layout. Reach for this when you want the "after" diagram to feel like one thick-bordered deep module with greyed-out internals.

### Cross-section (good for layered shallowness)

Stack horizontal bands (`h-12 border-l-4`) to show layers a call passes through. Before: 6 thin layers each doing nothing. After: 1 thick band labelled with the consolidated responsibility.

### Mass diagram (good for "interface as wide as implementation")

Two rectangles per module — one for interface surface area, one for implementation. Before: interface rectangle is nearly as tall as the implementation rectangle (shallow). After: interface rectangle is short, implementation rectangle is tall (deep).

### Call-graph collapse

Before: a tree of function calls rendered as nested boxes. After: the same tree collapsed into one box, with the now-internal calls shown faded inside it.

## Style guidance

- Lean editorial, not corporate-dashboard. Generous whitespace. System serif is optional for headings.
- Colour sparingly: one accent (emerald or indigo) plus red for leakage and amber for warnings.
- Keep diagrams ~320px tall so before/after sits comfortably side by side without scrolling.
- Use small uppercase labels with wider letter spacing inside diagrams — they should read as schematic, not as UI.
- The report contains no scripts or network-active content. Keep the CSP intact and render every repository-derived value as escaped text.

## Top recommendation section

One larger card. Candidate name, one sentence on why, anchor link to its card. That's it.

## Tone

Plain English, concise — but the architectural nouns and verbs come straight from [LANGUAGE.md](LANGUAGE.md). Concision is not an excuse to drift.

**Use exactly:** module, interface, implementation, depth, deep, shallow, seam, adapter, leverage, locality.

**Never substitute:** component, service, unit (for module) · API, signature (for interface) · boundary (for seam) · layer, wrapper (for module, when you mean module).

**Phrasings that fit the style:**

- "Order intake module is shallow — interface nearly matches the implementation."
- "Pricing leaks across the seam."
- "Deepen: one interface, one place to test."
- "Two adapters justify the seam: HTTP in prod, in-memory in tests."

**Wins bullets** name the gain in glossary terms: *"locality: bugs concentrate in one module"*, *"leverage: one interface, N call sites"*, *"interface shrinks; implementation absorbs the wrappers"*. Don't write *"easier to maintain"* or *"cleaner code"* — those terms aren't in the glossary and don't earn their place.

No hedging, no throat-clearing, no "it's worth noting that…". If a sentence could be a bullet, make it a bullet. If a bullet could be cut, cut it. If a term isn't in [LANGUAGE.md](LANGUAGE.md), reach for one that is before inventing a new one.
