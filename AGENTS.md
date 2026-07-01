<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## React Best Practices & Clean Code
- **Functional Components & Hooks**: Always use functional components. Avoid class components.
- **Strict Typing**: Use TypeScript rigorously. Avoid `any`. Define clear `Interfaces` and `Types` for props and state.
- **Single Responsibility**: Keep components small and focused. If a component grows too large, extract sub-components or custom hooks.
- **Performance**: Use `useMemo` for expensive calculations and `useCallback` for functions passed as props to avoid unnecessary re-renders.
- **Semantic HTML**: Use proper HTML5 tags (`<header>`, `<nav>`, `<main>`, `<article>`) instead of nested `<div>` soup.

## Next.js Best Practices & Clean Code
- **Server Components by Default**: Write Server Components by default to reduce client bundle size. Only add `'use client'` when you absolutely need React hooks (`useState`, `useEffect`) or browser APIs.
- **App Router Architecture**: Leverage the `app/` directory conventions (`layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`).
- **Data Fetching**: Prefer fetching data in Server Components natively with `async/await`. Avoid `useEffect` for data fetching unless completely necessary.
- **Optimization**: Always use `<Image>` from `next/image` and `<Link>` from `next/link` for automatic performance gains.
- **Colocation**: Keep related files (styles, tests, sub-components) close to the page/feature they belong to.

## General Coding Guidelines
- **Documentation**: Write clean, self-explanatory code. Provide thorough JSDoc documentation for all components, functions, interfaces, and complex logic.
- **English Language**: All code, variable names, comments, documentation, and interface text MUST be written strictly in English. No exceptions.
