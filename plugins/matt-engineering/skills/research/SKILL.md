---
name: research
description: Research a bounded engineering question from primary sources. Use for official documentation, source code, specifications, or APIs, especially when findings need a cited Markdown artifact.
---

# Research

Answer one bounded engineering question with auditable evidence. Default to the current agent. Background or parallel research is available only through [optional-enhancements.md](../../references/optional-enhancements.md).

## Scope

Before searching, state or infer:

- the exact question;
- what decision the answer will support;
- source and freshness requirements;
- what is explicitly outside scope.

Ask only when an ambiguity would materially change the research. Do not turn a narrow lookup into a broad market or architecture study.

## Evidence hierarchy

Prefer, in order appropriate to the question:

1. repository source code, tests, schemas, and pinned dependency versions;
2. official documentation, specifications, standards, and first-party API references;
3. upstream source code, release notes, issues, or maintainer statements;
4. high-quality secondary analysis only when primary sources do not answer the question.

For mutable facts, verify against current sources. For technical questions, do not treat search snippets, generated summaries, or unsourced community claims as proof.

## Method

1. Inspect local repository evidence first when the question concerns the current codebase.
2. Gather the smallest set of sources that can answer the question.
3. Cross-check important claims that depend on interpretation or version differences.
4. Record contradictions, version boundaries, and access limitations.
5. Separate:
   - **Confirmed fact** — directly supported by cited evidence;
   - **Inference** — a reasoned conclusion from facts, labelled as such;
   - **Unknown** — evidence is missing, contradictory, or inaccessible.
6. Answer the decision question, not merely summarize sources.

## Output

If the user wants only a chat answer, respond in chat and do not create a file. If the user requests durable research, or an authorized parent workflow needs an artifact, use the repository's existing research/docs convention. When no convention exists, propose a location before the first write.

A durable Markdown artifact should contain:

```markdown
# <Question>

## Decision summary
## Scope and method
## Confirmed findings
## Inferences
## Unknowns and limitations
## Implications
## Sources
```

Place citations next to the claims they support and link directly to primary pages or local source locations. Avoid long quotations. Record the relevant version, date, or source commit when it affects reproducibility.

## Boundaries

- Do not start a background agent merely because research is time-consuming.
- Do not mutate external systems.
- Do not write a repository artifact unless requested or authorized by the parent workflow.
- Do not present an inference as confirmed fact.
- Do not hide thin or inaccessible evidence; state the residual uncertainty.
