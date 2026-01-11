# AGENTS.md - PHI Web App Development Guidelines

This document provides guidelines for agentic coding assistants working on the PHI (Public Health Inspector) Office web application. Follow these conventions to maintain code quality and consistency.

## Build, Lint, and Test Commands

### Development Environment
This is a vanilla JavaScript web application with no build system. Files are served directly from the filesystem.

### Testing
**No formal testing framework is currently in use.** The application relies on manual testing and browser developer tools.

To run the application:
- Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
- The app uses localStorage for data persistence
- All functionality is client-side JavaScript

### Code Quality Checks
**No automated linting or formatting tools are configured.** Code quality is maintained through manual review and adherence to these guidelines.

### Manual Testing Checklist
When making changes, verify:
- [ ] Application loads without console errors
- [ ] Navigation between sections works correctly
- [ ] Form submissions save data to localStorage
- [ ] Data displays correctly in list views
- [ ] Mobile responsiveness works on different screen sizes
- [ ] Sinhala text displays properly

## Code Style Guidelines

### File Organization
- **HTML**: Main entry point is `index.html`
- **CSS**: Modular stylesheets in `css/` directory
  - `styles.css`: Main application styles
  - `components.css`: Reusable component styles
  - `dashboard.css`: Dashboard-specific styles
  - `books.css`: Books section styles
  - `boards.css`: Boards section styles
  - `registers/`: Register-specific styles
- **JavaScript**: Modular scripts in `js/` directory
  - `script.js`: Main application router and UI controller
  - `registers/`: Individual register modules
  - `reports/`: Report generation modules
  - `books/`: Book management modules
  - `phi/`: PHI area data management

### JavaScript Conventions

#### Module Structure
Use Immediately Invoked Function Expressions (IIFE) for encapsulation:
```javascript
(function () {
  "use strict";

  // Module code here

})();
```

#### Variable Declarations
- Use `const` for constants and variables that won't be reassigned
- Use `let` for variables that will be reassigned
- Avoid `var` declarations
- Declare variables at the top of their scope

#### Function Declarations
- Use function declarations for named functions
- Use arrow functions for anonymous functions and callbacks
- Keep functions focused on single responsibilities
- Use descriptive function names with camelCase

#### Naming Conventions
- **Variables**: camelCase (`userName`, `entryDate`)
- **Functions**: camelCase (`openSanitationRegister`, `formatDate`)
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEY`)
- **DOM IDs**: camelCase with descriptive names (`contentArea`, `sanitationForm`)
- **CSS Classes**: kebab-case (`tab-btn`, `glass-effect`)

#### String Handling
- Use template literals for string interpolation
- Always escape HTML output to prevent XSS:
```javascript
function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}
```

#### Date Handling
- Store dates in ISO format (YYYY-MM-DD)
- Use consistent date formatting functions:
```javascript
function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
```

#### Error Handling
- Use try/catch blocks for localStorage operations
- Provide fallback values for missing data
- Log errors to console for debugging
- Gracefully handle missing DOM elements

#### Event Handling
- Use `addEventListener` for attaching events
- Avoid inline event handlers in HTML
- Clean up event listeners when components are destroyed
- Use event delegation for dynamic content

### HTML Structure

#### Semantic HTML
- Use appropriate semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`)
- Maintain accessibility with proper heading hierarchy (h1 → h2 → h3)
- Include alt text for images

#### Dynamic Content
- Use `innerHTML` for inserting complex HTML structures
- Always escape user input before inserting into HTML
- Use data attributes for storing metadata (`data-tab`, `data-src`)

#### Forms
- Include `autocomplete="off"` for data entry forms
- Use appropriate input types (`number`, `date`, `text`)
- Add `required` attribute for mandatory fields
- Provide clear, descriptive labels

### CSS Conventions

#### Organization
- Use CSS custom properties (variables) for consistent theming
- Group related styles together
- Use descriptive class names
- Follow mobile-first responsive design principles

#### Naming
- Use BEM methodology where appropriate
- Keep class names semantic and descriptive
- Avoid overly specific selectors

#### Responsive Design
- Use flexible units (rem, em, %) instead of fixed pixels
- Implement mobile navigation with overlay patterns
- Test on multiple screen sizes

### Data Management

#### localStorage
- Use descriptive keys with versioning (`sanitationEntries_v2`)
- Handle JSON parsing errors gracefully
- Provide default empty arrays/objects for missing data
- Validate data structure before using

#### Data Structure
- Use consistent object property naming
- Include timestamps for audit trails
- Maintain referential integrity where possible

### Security Considerations

#### Input Validation
- Validate all user inputs on both client and server side
- Sanitize data before storage and display
- Prevent code injection through proper escaping

#### Data Privacy
- Be aware that localStorage data persists indefinitely
- Consider implementing data export/import features
- Follow healthcare data handling best practices

### Performance Guidelines

#### Script Loading
- Load scripts dynamically only when needed
- Use `async` attribute for non-blocking script loading
- Avoid loading unused modules

#### DOM Manipulation
- Minimize DOM queries by caching element references
- Use `DocumentFragment` for bulk DOM insertions
- Debounce rapid-fire events (search, scroll)

#### Memory Management
- Clean up event listeners and timers
- Avoid memory leaks in long-running applications
- Use efficient data structures

### Browser Compatibility

#### Target Browsers
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- ES5+ JavaScript features are acceptable
- Test on mobile browsers (iOS Safari, Chrome Mobile)

#### Progressive Enhancement
- Ensure core functionality works without JavaScript
- Gracefully degrade when features are unavailable
- Provide fallbacks for unsupported APIs

### Development Workflow

#### File Creation
- Follow existing directory structure
- Create modular, focused files
- Update main script.js for new routes/modules

#### Code Reviews
- Test all user interaction paths
- Verify data persistence works correctly
- Check for console errors and warnings
- Validate HTML structure and accessibility

#### Documentation
- Add comments explaining complex logic
- Document function parameters and return values
- Keep code self-documenting through clear naming

### Common Patterns

#### Module Loading
```javascript
function dynamicLoadScript(path, onSuccess, onFail) {
  if (document.querySelector(`script[data-src="${path}"]`)) {
    return setTimeout(() => {
      if (typeof onSuccess === 'function') onSuccess();
    }, 50);
  }
  const s = document.createElement("script");
  s.src = path;
  s.async = true;
  s.setAttribute("data-src", path);
  s.onload = () => { if (typeof onSuccess === 'function') onSuccess(); };
  s.onerror = () => {
    console.error("Failed to load", path);
    if (typeof onFail === 'function') onFail();
  };
  document.body.appendChild(s);
}
```

#### Tab Management
```javascript
function activateTab(tabId) {
  // Remove active class from all tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  // Add active class to selected tab
  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.classList.add('active');
}
```

#### Form Handling
```javascript
function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const entry = Object.fromEntries(formData);

  // Validate and process data
  if (validateEntry(entry)) {
    saveEntry(entry);
    refreshList();
    resetForm();
  }
}
```

### Quality Assurance

#### Pre-deployment Checks
- [ ] No console errors or warnings
- [ ] All navigation links work
- [ ] Forms submit and save data correctly
- [ ] Data loads and displays properly
- [ ] Mobile layout works on small screens
- [ ] Sinhala text renders correctly
- [ ] No broken images or missing assets

#### Code Quality Checklist
- [ ] Consistent code formatting
- [ ] Descriptive variable and function names
- [ ] Proper error handling
- [ ] HTML escaping for user input
- [ ] Event listener cleanup
- [ ] Memory leak prevention

This document should be updated as the project evolves and new patterns emerge.</content>
<parameter name="filePath">C:\Users\jeewa\Desktop\PHI Web app - Copy\frontend\AGENTS.md