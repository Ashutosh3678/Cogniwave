# Centralized Navigation System

## Overview
The navigation bar has been refactored into a single, centralized component that is now maintained in one place and dynamically loaded across all dashboard pages.

## Files Changed

### New File
- **navbar.js** - Centralized navigation component that:
  - Automatically detects the current page
  - Highlights the active navigation item
  - Generates the complete header HTML including logo, navigation pills, user profile, search button, and notifications
  - Injects the navigation into any page with `<div id="navbar-container"></div>`

### Updated Files
All dashboard HTML files now use the centralized navigation:
- **dash.html**
- **schedule.html**
- **analytics.html**
- **history.html**

## Changes Made

### Before
Each HTML file had its own hardcoded navigation header with ~60 lines of duplicated HTML code.

### After
Each HTML file now has:
1. A script tag loading navbar.js: `<script src="navbar.js"></script>`
2. A simple container div: `<div id="navbar-container"></div>`

The navigation HTML is now generated and injected automatically by navbar.js.

## Benefits

✅ **Single Source of Truth** - Navigation is defined in one place (navbar.js)
✅ **Easy Maintenance** - Update navigation once, applies to all pages
✅ **Automatic Active State** - Current page is automatically highlighted
✅ **Consistent Styling** - Ensures all pages have identical navigation
✅ **DRY Principle** - Eliminates ~240 lines of duplicated code
✅ **Easy to Extend** - Add new nav items or features in one location

## How It Works

1. **Page Load**: When any dashboard page loads, navbar.js executes
2. **Page Detection**: The script detects which page is currently active using `window.location.pathname`
3. **HTML Generation**: Generates the complete header HTML with proper active states
4. **Injection**: Injects the HTML into the `navbar-container` div
5. **Styling**: Uses existing Tailwind classes and custom CSS for consistent appearance

## Customization

To modify the navigation, edit the `navbar.js` file:

- **Add/Remove Nav Items**: Update the `navItems` array
- **Change Styling**: Modify the `activeClasses` or `inactiveClasses` variables
- **Update User Info**: Edit the user profile section in the `generateNavbar()` function
- **Add Features**: Extend the navigation with additional buttons or functionality

## Example: Adding a New Page

To add a new navigation item:

```javascript
const navItems = [
    { href: 'dash.html', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dash.html' },
    { href: 'schedule.html', icon: 'far fa-calendar-alt', label: 'Schedule', page: 'schedule.html' },
    { href: 'analytics.html', icon: 'fas fa-chart-bar', label: 'Analytics', page: 'analytics.html' },
    { href: 'history.html', icon: 'fas fa-history', label: 'History', page: 'history.html' },
    // Add new item here:
    { href: 'settings.html', icon: 'fas fa-cog', label: 'Settings', page: 'settings.html' }
];
```

Then create `settings.html` with:
```html
<script src="navbar.js"></script>
</head>
<body>
    <div id="navbar-container"></div>
    <!-- Your page content -->
</body>
```

The navigation will automatically include the new page with proper active state highlighting!
