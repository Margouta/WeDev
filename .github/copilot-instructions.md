# Web Application Development Guidelines

## Programming Language: JavaScript

**JavaScript Best Practices:**
- Use modern ES2020+ syntax and features
- Prefer `const` and `let` over `var` for variable declarations
- Use arrow functions for callbacks and concise functions
- Implement proper async/await patterns instead of callback chains
- Use destructuring assignment for cleaner code
- Follow consistent naming conventions (camelCase for variables/functions)

## Framework: Svelte & SvelteKit

**SvelteKit Architecture:**
- This is a full-stack SvelteKit application using file-based routing
- Server-side logic in `+server.js` files for API endpoints
- Page logic split between `+page.server.js` (server) and `+page.svelte` (client)
- Layout files (`+layout.svelte`, `+layout.server.js`) for shared UI and data

**Svelte Best Practices:**
- Use reactive declarations (`$:`) for derived state
- Prefer component composition over complex single components
- Keep components focused and reusable
- Use stores (`$lib/stores/`) for global state management
- Leverage Svelte's built-in transitions and animations
- Avoid unnecessary reactivity - be intentional with `$:` usage

## Project Structure

### Directory Organization

```
src/
├── components/          # Reusable UI components
│   ├── navbar.svelte   # Navigation bar
│   ├── footer.svelte   # Footer component
│   ├── uploader.svelte # File upload component
│   └── typedText.svelte # Animated text component
├── lib/
│   ├── server/         # Server-side utilities
│   │   └── db.js       # Database connection and queries
│   ├── stores/         # Svelte stores for state management
│   │   └── theme.js    # Theme store (dark/light mode)
│   └── assets/         # Static assets (images, fonts, etc.)
├── routes/             # File-based routing
│   ├── +layout.svelte  # Root layout (wraps all pages)
│   ├── +layout.server.js # Root server layout logic
│   ├── +page.svelte    # Home page
│   ├── api/            # API endpoints
│   │   ├── tournages/  # Shooting sessions API
│   │   └── users/      # Users API
│   ├── auth/           # Authentication routes
│   ├── dashboard/      # Dashboard pages
│   ├── login/          # Login page
│   └── logout/         # Logout endpoint
├── app.html            # HTML template
└── hooks.server.js     # Server hooks (middleware)
```

### Component Architecture

**When to Create Components:**
- UI elements used in multiple places
- Complex UI sections that exceed 100-150 lines
- Self-contained functionality with clear responsibilities
- Reusable patterns (cards, modals, forms, etc.)

**Component Naming:**
- Use PascalCase for component files in imports
- Use lowercase with hyphens for file names: `component-name.svelte`
- Prefix with purpose: `modal-`, `card-`, `form-`, etc.

**Component Structure:**
```svelte
<script>
  // 1. Imports
  import { onMount } from 'svelte';
  
  // 2. Props
  export let data;
  export let disabled = false;
  
  // 3. Local state
  let isLoading = false;
  
  // 4. Reactive declarations
  $: isValid = data && data.length > 0;
  
  // 5. Functions
  function handleAction() {
    // Logic here
  }
  
  // 6. Lifecycle
  onMount(() => {
    // Initialization
  });
</script>

<!-- 7. Markup -->
<div class="component">
  <!-- Content -->
</div>

<!-- 8. Styles (if component-specific) -->
<style>
  .component {
    /* Styles */
  }
</style>
```

## Code Style: Clean Code

**Clean Code Principles:**
- Write self-documenting code with meaningful names
- Keep functions small and focused on a single responsibility
- Avoid deep nesting and complex conditional statements
- Use consistent formatting and indentation
- Write code that tells a story and is easy to understand
- Refactor ruthlessly to eliminate code smells

**File Size Guidelines:**
- Pages should not exceed 300-400 lines
- Components should stay under 200 lines
- Extract complex logic into separate utility files
- Split large pages into smaller, focused components

## Component Extraction Best Practices

### When to Extract Components

Extract components when you encounter:
1. **Repeated markup patterns** - DRY principle
2. **Large page files** (>300 lines) - Maintainability
3. **Distinct UI sections** - Card-based layouts, panels
4. **Independent functionality** - Self-contained logic
5. **Different data contexts** - Separate concerns

### How to Extract Components Properly

1. **Identify logical boundaries:**
   - Look for distinct visual sections (cards, panels, modals)
   - Find repeated patterns or similar structures
   - Isolate independent features

2. **Define clear props interface:**
   ```svelte
   <script>
     // Clear, typed props
     export let tournage; // Main data object
     export let user;     // User context
     export let disabled = false; // Optional with defaults
   </script>
   ```

3. **Keep component focused:**
   - Single responsibility principle
   - Minimal props (aim for <5 required props)
   - Self-contained styling when possible

4. **Handle state appropriately:**
   - Local state stays in component
   - Shared state via props or stores
   - Event dispatching for parent communication

5. **Naming conventions:**
   - Descriptive names: `WelcomeCard.svelte`, `TimerCard.svelte`
   - Group related components: `dashboard/`, `cards/`
   - Suffix with purpose: `*Card`, `*Modal`, `*Form`

### Example: Extracting Cards from Dashboard

**Before: Monolithic Dashboard**
```svelte
<!-- Single 1800+ line file with all cards inline -->
<div class="row">
  <div class="col-12">
    <div class="card">
      <!-- 200 lines of welcome card -->
    </div>
  </div>
  <div class="col-6">
    <div class="card">
      <!-- 150 lines of timer card -->
    </div>
  </div>
  <!-- More cards... -->
</div>
```

**After: Component-Based Dashboard**
```svelte
<script>
  import WelcomeCard from '$lib/components/dashboard/WelcomeCard.svelte';
  import TimerCard from '$lib/components/dashboard/TimerCard.svelte';
  import InstructionsCard from '$lib/components/dashboard/InstructionsCard.svelte';
  
  export let data;
</script>

<div class="row row-deck row-cards">
  <div class="col-12 col-lg-6">
    <WelcomeCard user={data.user} />
  </div>
  <div class="col-sm-6 col-lg-3">
    <TimerCard 
      tournage={selectedTournage} 
      passageStarted={passageStarted}
      passageEnded={passageEnded}
    />
  </div>
  <div class="col-sm-6 col-lg-3">
    <InstructionsCard 
      cgu={selectedTournage.cgu}
      on:accept={handleCguAccept}
    />
  </div>
</div>
```

### Benefits of Proper Component Extraction

- **Readability:** Main page shows structure at a glance
- **Maintainability:** Changes isolated to specific components
- **Reusability:** Components can be used elsewhere
- **Testability:** Easier to test individual components
- **Performance:** Potential for better optimization
- **Collaboration:** Multiple developers can work on different components

## Database & Server-Side

**Database Pattern:**
- Use `src/lib/server/db.js` for all database operations
- Create specific functions for each query/operation
- Always use parameterized queries to prevent SQL injection
- Handle errors gracefully with try-catch blocks

**API Endpoints:**
- RESTful conventions in `routes/api/`
- Return JSON with proper status codes
- Validate input data on server-side
- Use form actions in `+page.server.js` for form handling

## UI Framework: Tabler

**Tabler CSS Framework:**
- Use Tabler's utility classes for consistent styling
- Card-based layouts with `.card`, `.card-body`, `.card-header`
- Icons from Tabler Icons (SVG)
- Responsive grid system (`.col-*`)
- Theme support (light/dark mode)

**Tabler Components to Use:**
- Cards for content sections
- Ribbons for status indicators (`.ribbon`)
- Buttons with icons (`.btn`, `.btn-primary`)
- Form controls (`.form-control`, `.form-select`)
- Alerts for messages (`.alert`)
- Empty states (`.empty`)

## AI Code Generation Preferences

When generating code, please:

- Generate complete, working code examples with proper imports
- Include inline comments for complex logic and business rules
- Follow the established patterns and conventions in this project
- Suggest improvements and alternative approaches when relevant
- Consider performance, security, and maintainability
- Include error handling and edge case considerations
- Generate appropriate unit tests when creating new functions
- Follow accessibility best practices for UI components
- Use semantic HTML and proper ARIA attributes when applicable

### Component Creation Checklist

When creating new components:
- [ ] Clear, single responsibility
- [ ] Minimal, well-defined props interface
- [ ] Proper prop validation with defaults
- [ ] Reactive declarations for derived state
- [ ] Event dispatching for parent communication
- [ ] Accessibility attributes (ARIA, semantic HTML)
- [ ] Responsive design considerations
- [ ] Error handling and edge cases
- [ ] Consistent with Tabler design system
- [ ] Documented with JSDoc comments if complex

### Code Review Standards

Before committing code:
- [ ] No console.log statements in production
- [ ] Proper error handling (no bare try-catch)
- [ ] Accessible markup (proper labels, ARIA)
- [ ] Responsive on mobile and desktop
- [ ] No hardcoded values (use constants/config)
- [ ] Consistent naming conventions
- [ ] Comments for complex logic
- [ ] No unused imports or variables
- [ ] Follows project file structure

## Security Considerations

- Never expose sensitive data in client-side code
- Validate and sanitize all user inputs
- Use server-side validation for all forms
- Implement proper authentication checks in server hooks
- Use HTTPS in production
- Sanitize HTML content (use `@html` cautiously)
- Implement rate limiting for API endpoints
- Use environment variables for secrets