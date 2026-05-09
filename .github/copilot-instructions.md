# Copilot Instructions

## Core Style

- Write simple, direct code that is easy to read and debug.
- Prefer boring, explicit implementations over clever abstractions.
- Keep functions small enough that their behavior is obvious from local context.
- Name variables and functions after the thing they represent, not after implementation details.
- Optimize for correctness and clarity first. Optimize for performance only when there is evidence.

## Working Approach

- Read the surrounding code before changing behavior.
- Preserve existing architecture, naming, and formatting unless there is a clear reason to change them.
- Make the smallest change that fully solves the problem.
- Avoid broad rewrites, speculative abstractions, and unrelated cleanup.
- Treat user data, file paths, browser storage, and task state as important application state.

## JavaScript And Frontend Guidance

- Prefer plain JavaScript and DOM APIs when they match the existing codebase.
- Keep state transitions explicit and centralized where practical.
- Avoid hidden coupling between UI rendering, persistence, and business logic.
- Use defensive checks around optional DOM elements and persisted data.
- Keep user-facing interactions responsive and predictable.

## Error Handling

- Fail visibly when silent failure would hide data loss or broken state.
- Add guards for malformed persisted data, missing elements, and unexpected user input.
- Keep error paths simple and easy to inspect.

## Tests And Verification

- When changing behavior, verify the specific workflow affected by the change.
- Add focused tests when the project has an established test pattern.
- If automated tests are unavailable, document the manual verification path.

## Comments

- Use comments to explain why something non-obvious exists.
- Do not comment code that is already clear from names and structure.

## Review Checklist

- Does the change solve the requested problem without unrelated edits?
- Is the behavior understandable from nearby code?
- Are edge cases around missing data, stale state, and repeated actions handled?
- Is there any risk of losing user-entered task data?
- Is the UI still usable on small screens and common desktop sizes?
