# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **codeLib2-htmldoc**, a React-based documentation browser for a code library. It displays programming snippets with metadata, search functionality, and article-style viewing. The app loads data from `/public/data/codelib_full.json` and serves articles at routes like `/path/to/article.html`.

## Development Commands

- **Start development server**: `pnpm dev` (serves on http://localhost:8020/codeLib2)
- **Build for production**: `pnpm build`
- **Lint code**: `pnpm lint` (runs prettier and eslint)
- **Fix linting issues**: `pnpm lint-fix`

## Architecture

### Container/Component Pattern
- **`/src/containers`**: Smart components connected to Redux (SideSearchFrame, TopContentFrame, FetchCodeLib)
- **`/src/components`**: Dumb UI components (Badge, Header, CodeLibArticleViewer, etc.)
- **`/src/stores`**: Redux store with separate modules for `codelib` and `searchbox` state

### Key Libraries
- **State Management**: Redux with React-Redux
- **Type Safety**: io-ts for runtime type validation of data from `codelib_full.json`
- **Functional Programming**: fp-ts library integration
- **Styling**: SCSS with CSS Modules (generates `.scss.d.ts` type definitions)

### Data Flow
1. `FetchCodeLib` container loads data from `/public/data/codelib_full.json`
2. Data is validated using io-ts decoders in `/src/lib/CodeLib.ts`
3. State is managed in Redux store modules
4. Components render articles with syntax highlighting and metadata

### Critical Files
- **`/src/lib/CodeLib.ts`**: Core data fetching and type validation
- **`/src/lib/Config.ts`**: Application configuration
- **`/src/stores/codelib.ts`**: Main state management for code library data
- **`/src/components/CodeLibArticleViewer`**: Primary article display component

## Styling System

Uses CSS Modules with SCSS. Style files generate TypeScript definitions (`.scss.d.ts`) that may need regeneration after style changes. The root serves from `/codeLib2` path.

## Data Structure

Articles in `codelib_full.json` contain:
- Core content: title, overview, sourceCode, language
- Metadata: filePath, requirements, keywords, references
- Verification: isVerified, testResult, gitLog