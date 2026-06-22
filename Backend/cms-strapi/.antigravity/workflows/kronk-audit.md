# Quality Audit with Kronk

Run a comprehensive quality audit on the Strapi project.

## Audit Scope

Check all content in `src/api/` for:

- SEO: meta tags, titles, descriptions
- Accessibility: headings, alt text, link text
- Performance: image sizes, lazy loading
- Security: external links, sanitization

## Instructions

1. List all content files in `src/api/`
2. For each file, check:
   - Front matter completeness
   - Heading hierarchy
   - Image alt text
   - Link text quality
   - Meta description length
3. Report issues by severity:
   - 🔴 Critical: Missing required fields
   - 🟠 Warning: Quality recommendations
   - 🟢 Info: Best practice suggestions
4. Provide specific fixes for each issue

## Output Format

```
## Audit Results

### Critical Issues (must fix)
- [file.md] Description of issue

### Warnings (should fix)
- [file.md] Description of issue

### Suggestions (nice to have)
- [file.md] Description of suggestion

## Summary
- Files audited: X
- Critical issues: X
- Warnings: X
```

## Audit Request

$ARGUMENTS

If no specific files mentioned, audit all content in `src/api/`.
