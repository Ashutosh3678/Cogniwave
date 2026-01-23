# Cogni:wave React App

A modern mental health platform built with React and Vite.

## Features

- 🎨 Modern, responsive landing page
- 💜 Purple-themed mental health design
- 📊 Statistics section showcasing platform metrics
- 🎥 Background video integration
- ⚡ Built with Vite for fast development

## Project Structure

```
cogniwave-react/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Navigation header
│   │   ├── HeroSection.jsx     # Hero with video background
│   │   ├── StatsSection.jsx    # Platform statistics
│   │   └── Footer.jsx          # Footer component
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # Global styles
│   └── main.jsx                # Entry point
├── public/
│   └── landing_video.mp4       # Background video
└── index.html                  # HTML template
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Navigate to the project directory
cd frontend/cogniwave-react

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern features
- **Inter Font** - Google Fonts typography

## Components Overview

### Header
- Logo and branding
- Navigation menu
- Dark mode toggle (UI only)
- Contact button

### HeroSection
- Full-viewport hero section
- Background video with overlay
- Main headline
- Interactive card with CTA buttons

### StatsSection
- 4 key platform metrics
- Animated hover effects
- Responsive grid layout

### Footer
- Copyright information
- Legal links
- Responsive layout

## Customization

### Colors
The main brand color is `#7A5AF8` (purple). You can customize this in `App.css`:

```css
.logo-text {
  color: #8B5CF6; /* Adjust logo color */
}

.stat-number {
  color: #7A5AF8; /* Adjust stat numbers */
}
```

### Content
Edit component files in `src/components/` to update content.

## License

© 2024 Cogni:wave. All rights reserved.
