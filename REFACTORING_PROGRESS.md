# Questline Exporter Test - Refactoring Progress

## ✅ COMPLETED

### 1. Build System & Dependencies
- ✅ Updated `package.json` to use Vite instead of react-scripts
- ✅ Added modern dependencies (React 19, Vite 7, Vitest 3, Playwright, ESLint 9)
- ✅ Created `vite.config.ts` with path aliases
- ✅ Created `vitest.config.ts` for testing
- ✅ Updated `tsconfig.json` with modern settings and path aliases
- ✅ Created `tsconfig.node.json` for build scripts
- ✅ Installed all dependencies successfully

### 2. Linting & Formatting
- ✅ Created `eslint.config.js` with ESLint 9 flat config
- ✅ Created `.prettierrc` for code formatting
- ✅ Created `.prettierignore`

### 3. Testing Infrastructure
- ✅ Created test utility scripts:
  - `scripts/run-vitest.mjs`
  - `scripts/cleanup-vitest.mjs`
  - `scripts/run-playwright.mjs`
- ✅ Created `playwright.config.ts` for e2e tests
- ✅ Updated `src/setupTests.ts` to use Vitest instead of Jest
- ✅ Created `src/vite-env.d.ts` and `src/vitest-globals.d.ts`

### 4. Directory Structure
- ✅ Created new directory structure:
  - `src/lib/` - Reusable questline components
  - `src/lib/components/` - QuestlineViewer and renderers
  - `src/lib/hooks/` - State management hooks
  - `src/lib/utils/` - Utility functions
  - `src/lib/theme/` - Design tokens
  - `src/lib/types/` - TypeScript types
  - `src/lib/test-utils/` - Testing utilities
  - `src/demo/` - Demo application
  - `src/demo/components/` - AppBar, Sidebar
  - `src/tests/` - Test files

- ✅ Moved existing files to new locations:
  - QuestlineViewer → `src/lib/components/`
  - Renderers → `src/lib/components/renderers/`
  - Hooks → `src/lib/hooks/`
  - Utils → `src/lib/utils/`
  - types.ts → `src/lib/types.ts`
  - Context → `src/lib/hooks/`

### 5. Theme System
- ✅ Created `src/lib/theme/tokens.ts` with design tokens
- ✅ Created `src/lib/theme/index.ts` for theme exports

### 6. Library Exports
- ✅ Created `src/lib/index.ts` to export all library components and types

### 7. Demo App Components
- ✅ Created `src/demo/components/AppBar.tsx`
- ✅ Created GitHub icon asset in `public/assets/github.svg`

### 8. Build Files
- ✅ Created `index.html` for Vite

## ⏳ IN PROGRESS / TODO

### 9. Demo App Components (CRITICAL)
- ⏳ Create `src/demo/components/Sidebar.tsx` - Reusable sidebar with controls
- ⏳ Create `src/demo/App.tsx` - Main demo application
- ⏳ Create `src/demo/App.css` - Demo app styles (layout, appbar, sidebar, drawer)
- ⏳ Update `src/index.tsx` - Entry point with lazy loading

### 10. Component Visibility Feature
- ⏳ Add component visibility state management in demo App
- ⏳ Add toggle buttons in Sidebar for each questline component:
  - Background
  - Header
  - Quests
  - Rewards
  - Timer
  - Button

### 11. Update Component Imports
- ⏳ Update all imports in moved files to use path aliases (@lib, @components, etc.)
- ⏳ Fix import paths in QuestlineViewer.tsx
- ⏳ Fix import paths in all renderer components
- ⏳ Fix import paths in hooks
- ⏳ Fix import paths in utils

### 12. Test Migration
- ⏳ Convert Jest tests to Vitest syntax
- ⏳ Update test imports to use path aliases
- ⏳ Move tests to appropriate locations
- ⏳ Create Playwright e2e tests

### 13. CSS Organization
- ⏳ Separate library CSS from demo CSS
- ⏳ Add CSS custom properties for theming
- ⏳ Implement responsive layout with:
  - Sticky app bar (mobile)
  - Desktop sidebar (>1220px)
  - Mobile drawer (≤1219px)
  - Main content area

### 14. Final Steps
- ⏳ Run linter and fix any issues: `npm run lint`
- ⏳ Run type checker: `npm run typecheck`
- ⏳ Test dev server: `npm run dev`
- ⏳ Run all tests: `npm test`
- ⏳ Run e2e tests: `npm run test:e2e`
- ⏳ Build production: `npm run build`

## 📋 NEXT IMMEDIATE STEPS

1. **Create Sidebar Component** (`src/demo/components/Sidebar.tsx`)
   - File upload section
   - Questline controls (width, height)
   - Component visibility toggles
   - Information display

2. **Create Demo App** (`src/demo/App.tsx`)
   - App bar integration
   - Sidebar (desktop) / Drawer (mobile)
   - Main content area with QuestlineViewer
   - Component visibility state management

3. **Create App Styles** (`src/demo/App.css`)
   - Layout system
   - App bar styles
   - Sidebar styles
   - Drawer with overlay
   - Responsive breakpoints

4. **Update Entry Point** (`src/index.tsx`)
   - Lazy load App from demo/
   - Add suspense fallback

5. **Fix All Import Paths**
   - Use find/replace to update imports to use aliases
   - Test that all files compile

## 🎯 KEY ARCHITECTURAL CHANGES

### Before (Old Structure)
```
src/
  ├── components/       # Mixed library + app code
  ├── context/          # Context hooks
  ├── hooks/            # Custom hooks
  ├── utils/            # Mixed utilities
  ├── App.tsx           # Everything in one file
  └── App.css           # All styles together
```

### After (New Structure)
```
src/
  ├── lib/              # 🆕 Reusable library code
  │   ├── components/   # QuestlineViewer + renderers
  │   ├── hooks/        # State management
  │   ├── utils/        # Pure utilities
  │   ├── theme/        # 🆕 Design tokens
  │   ├── types.ts      # TypeScript definitions
  │   └── index.ts      # 🆕 Public API
  ├── demo/             # 🆕 Demo application
  │   ├── components/   # 🆕 AppBar, Sidebar
  │   ├── App.tsx       # 🆕 Demo app with layout
  │   └── App.css       # 🆕 Demo-specific styles
  ├── tests/            # 🆕 Test files
  └── index.tsx         # Entry point
```

## 🔑 KEY FEATURES TO IMPLEMENT

1. **AppBar** - Sticky mobile header with hamburger menu
2. **Sidebar** - Reusable controls panel
3. **Drawer** - Mobile slide-in sidebar with overlay
4. **Component Visibility** - Toggle individual elements
5. **Responsive Layout** - Desktop (sidebar) vs Mobile (drawer)
6. **Theme System** - Consistent design tokens
7. **Path Aliases** - Clean imports (@lib, @demo, etc.)

## 📝 NOTES

- The project structure now matches the wheel-exporter-test standards
- Library code is completely separate from demo app code
- Modern build tooling (Vite) replaces create-react-app
- Testing uses Vitest + Playwright instead of Jest
- ESLint 9 with flat config
- React 19 with latest TypeScript
