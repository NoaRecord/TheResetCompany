# Known Codex Environment Note

Date recorded: 2026-09-28

## Context

A different project on the same Windows PC is currently paused while the user is communicating with support about a Codex sandbox problem in which PowerShell does not start correctly.

The current working theory from that project's discussion is that the visible PowerShell symptom may not be the root cause; a file ownership/permission problem involving `.gitignore` has been suspected.

This has **not** been established as a problem in TheResetCompany. TheResetCompany begins in a new directory and should be tested cleanly before assuming the older failure applies here.

## Rules for this project

If command execution works normally, proceed normally.

If PowerShell or shell startup fails:

1. record the exact command and exact error;
2. distinguish sandbox/shell failure from game/application/test failure;
3. do not change file ownership, Windows ACLs, permissions, `.gitignore` ownership, global Codex settings, or sandbox configuration speculatively;
4. do not perform destructive Git operations as a workaround;
5. Git Bash may be used as a temporary command runner when available, but this should not be reported as proof that the underlying sandbox issue is fixed;
6. report the environment problem separately from code results.

Do not copy fixes from the paused unrelated project into this project without evidence that the same cause exists.
