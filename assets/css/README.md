# CSS Architecture

This directory contains the modularized Tailwind CSS v4 styles for the Toolbox project.

## File Structure

```
css/
├── main.css                 # Main entry point - imports all modules
├── main.min.css            # Original minified file (backup)
├── theme/                  # Design tokens and CSS variables
│   ├── colors.css          # All color definitions (20+ color families)
│   ├── typography.css      # Font families, sizes, weights
│   ├── spacing.css         # Spacing scales and breakpoints
│   └── effects.css         # Animations, transitions, shadows
├── base/                   # CSS reset and default styles
│   └── reset.css           # Base element styles and normalization
├── components/             # Reusable component patterns
│   └── components.css      # Custom component compositions
└── utilities/              # Utility classes
    └── all-utilities.css   # All utility classes

```

## Benefits of This Structure

1. **Maintainability**: Each file has a single responsibility
2. **Modularity**: Import only what you need
3. **Customization**: Easy to modify specific aspects
4. **Performance**: Can optimize individual modules
5. **Collaboration**: Reduces merge conflicts
6. **Documentation**: Clear organization makes onboarding easier

## Usage

### Using the Complete System
```html
<link rel="stylesheet" href="/assets/css/main.css">
```

### Selective Imports
To use only specific modules, create a custom entry file:
```css
/* custom.css */
@import "./theme/colors.css";
@import "./theme/typography.css";
@import "./base/reset.css";
/* Skip components and utilities if not needed */
```

## Customization

### Adding Custom Colors
Edit `theme/colors.css` to add new color variables:
```css
--color-brand-500: oklch(0.6 0.25 250);
```

### Adding Components
Add new component patterns to `components/components.css`:
```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded;
  }
}
```

## Build Process

For production:
1. Process with PostCSS/Tailwind CLI
2. Minify the output
3. Optimize with PurgeCSS if needed

## Original File

The original minified file is preserved as `main.min.css` for reference and fallback.