# GardenTwin Architecture – React

A standalone interactive architecture component, without third-party UI dependencies.

## Installation
Copy `GardenTwinArchitecture.jsx` into a React project, for example `src/components/`.

```jsx
import GardenTwinArchitecture from './components/GardenTwinArchitecture';

export default function App() {
  return <GardenTwinArchitecture />;
}
```

Compatible with React 18+ and common Vite/Next.js setups. In Next.js App Router, add `'use client';` as the first line of the component file.

This is an architecture visualization, not a live IoT backend. It uses mocked modules and animated schematic connections. Real integrations, authorization, device certificates, safety controls and services must be implemented separately.
