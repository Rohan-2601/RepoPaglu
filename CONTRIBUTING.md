# Contributing to RepoPaglu

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to RepoPaglu. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for RepoPaglu. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the steps to reproduce the problem** in as much detail as possible.
- **Include screenshots and animated GIFs** which show you following the described steps and demonstrate the problem.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for RepoPaglu, including completely new features and minor improvements to existing functionality.

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as much detail as possible.
- **Explain why this enhancement would be useful** to most RepoPaglu users.


### Pull Request Process

1.  **Fork the repo** and create your branch from `main`.
2.  **Install dependencies** by running `npm install` in the root directory.
3.  **Ensure compatibility** with the monorepo structure.
4.  **Update documentation** if you change functionality.
5.  **Issue that Pull Request!**

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or less.
- Reference issues and pull requests liberally after the first line.

### JavaScript/TypeScript Styleguide

- We use **Prettier** for code formatting. Please ensure your code is formatted before submitting.
- We use **ESLint** for linting. Run `npm run lint` (if available in workspaces) to check for errors.

## Development Setup

See the [README.md](./README.md) for detailed instructions on setting up the project locally.

```bash
git clone https://github.com/Rohan-2601/RepoPaglu
cd RepoPaglu
npm install
npm run dev:web   # Start Frontend
npm run dev:server # Start Backend
```
