# Polychord V2

A modern language learning application built with React, TypeScript, and Phaser.js.

## Features

- Interactive language learning games
- Vocabulary lessons with audio pronunciation
- Progress tracking
- Multiple game types: Quiz, Matching, Memory, Puzzle, Typing, and Listening
- Support for multiple languages
- Modern UI with Tailwind CSS

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
cd project
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

#### Setup Instructions:

1. **Enable GitHub Pages in your repository settings:**
   - Go to Settings > Pages
   - Select "GitHub Actions" as the source

2. **Push your changes to the main branch:**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

3. **The GitHub Action will automatically:**
   - Build the project
   - Deploy to GitHub Pages
   - Make it available at `https://yourusername.github.io/Polychordv2/`

#### Manual Deployment (Alternative):

If you prefer manual deployment using gh-pages:

```bash
npm run deploy
```

This will build the project and deploy it to the `gh-pages` branch.

### Local Testing of Production Build

```bash
npm run preview
```

## Project Structure

```
project/
├── src/
│   ├── components/     # React components
│   ├── games/          # Game logic (Phaser.js)
│   ├── hooks/          # Custom React hooks
│   ├── data/           # Language data and translations
│   ├── contexts/       # React contexts
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
└── dist/              # Production build output
```

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **Phaser.js** - Game engine for interactive games
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Game Types

1. **Quiz Game** - Multiple choice questions
2. **Matching Game** - Match words with translations
3. **Memory Game** - Find matching pairs
4. **Puzzle Game** - Unscramble letters
5. **Typing Game** - Type the correct translation
6. **Listening Game** - Listen and choose the correct answer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.
