---
name: tdd
description: Develop concrete behavior test-first through one RED and GREEN vertical slice at a time. Use for TDD, test-first development, red-green-refactor, or behavior-led implementation.
---

# Test-Driven Development

TDD is a hard RED → GREEN feedback loop that produces tests worth keeping. Read [quality-baseline.md](../../references/quality-baseline.md), [tests.md](tests.md), and [mocking.md](mocking.md).

Use the project's domain glossary and relevant ADRs so test names and behavior match established language. Use `codebase-design` as the single source for module depth, interface, and seam vocabulary.

## Choose the behavior and seam

Select one observable behavior and the highest practical public seam that exercises it. Tests should use the same interface as real callers, not private methods or implementation-only side channels.

- Reuse an obvious established seam without repeated confirmation.
- Explain and confirm a new, ambiguous, or expensive seam before adding it.
- If no correct seam can exercise the behavior, report the architecture limitation rather than adding a misleading shallow test.

## One vertical cycle

### RED

1. Write one focused behavior test.
2. Derive expected values from the requirement, a worked example, protocol/specification, trusted fixture, or independent calculation.
3. Run the focused test.
4. Confirm it fails for the expected missing or broken behavior—not a syntax, fixture, or environment mistake.

### GREEN

1. Make the smallest production change that satisfies the test.
2. Run the focused test and confirm it passes.
3. Run nearby affected tests or checks to catch collateral breakage.

Only then choose the next behavior and repeat.

## GREEN micro-refactor

While tests remain GREEN, make small local improvements needed for immediate readability or duplication. Rerun affected tests after each material step. Do not fold a systematic redesign, broad cleanup, or speculative abstraction into the loop; surface it during `code-review` or as a separate architecture task.

## Anti-patterns

- **Horizontal slicing:** writing all tests and then all implementation.
- **Implementation coupling:** mocking internal collaborators, testing private methods, or asserting call choreography instead of behavior.
- **Tautology:** deriving the expected value with the same algorithm or source as the implementation.
- **False RED:** a test fails because setup is broken rather than because the behavior is missing.
- **Speculation:** adding hooks or generalized interfaces for imagined future tests.
- **Over-mocking:** mock only true system boundaries such as external services, time, randomness, or expensive infrastructure when a real adapter is impractical.

## Per-cycle checklist

- [ ] One observable behavior.
- [ ] Correct public seam.
- [ ] Independent expected value.
- [ ] RED observed for the expected reason.
- [ ] Minimal implementation.
- [ ] GREEN observed with nearby checks intact.
- [ ] No speculative scope.
