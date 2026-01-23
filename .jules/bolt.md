## 2024-05-22 - [Polling & Re-renders]
**Learning:** Background polling (like `refetchInterval` in `useQuery`) in a root component causes the entire component tree to re-render on every poll cycle, even if data hasn't changed, unless children are memoized.
**Action:** When implementing polling at the root level, ensure all expensive child components are wrapped in `React.memo` and all props passed to them (handlers) are stable using `useCallback`.
