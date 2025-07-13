# Polychord V2 - Deployment Guide

## 🚀 Quick Deployment (Current Setup)

### Manual Deployment (Recommended)
```bash
# Deploy to GitHub Pages
npm run deploy
```

This single command will:
- Build your project for production
- Deploy to GitHub Pages
- Update your live site at: https://rogerjs93.github.io/Polychordv2/

---

## 📋 Development Workflow

### 1. Local Development
```bash
# Start development server
npm run dev

# View at: http://localhost:3000
```

### 2. Build and Test Production
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Deploy to GitHub Pages
```bash
# Deploy (builds and deploys automatically)
npm run deploy
```

---

## ⚙️ Configuration Details

### Current Setup
- **Repository**: https://github.com/rogerjs93/Polychordv2
- **Live Site**: https://rogerjs93.github.io/Polychordv2/
- **Deployment Method**: Manual via `gh-pages` package
- **Base URL**: `/Polychordv2/` (configured in `vite.config.ts`)

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

---

## 🔄 Alternative: Automatic Deployment (GitHub Actions)

If you want automatic deployment when pushing to `master` branch:

### Steps to Enable:
1. Go to repository Settings → Pages
2. Change source to **"GitHub Actions"**
3. Push to `master` branch → automatic deployment

### GitHub Actions Workflow File
The workflow file is saved at: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: './project/package-lock.json'
          
      - name: Install dependencies
        run: |
          cd project
          npm ci
          
      - name: Build
        run: |
          cd project
          NODE_ENV=production npm run build
          
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './project/dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. MIME Type Errors
- **Problem**: "Loading module blocked because of disallowed MIME type"
- **Solution**: Ensure `base: '/Polychordv2/'` in `vite.config.ts`

#### 2. 404 Errors on Assets
- **Problem**: Assets not loading (favicon.svg, CSS, JS files)
- **Solution**: Check base URL configuration and rebuild

#### 3. GitHub Pages Not Updating
- **Problem**: Changes not reflected on live site
- **Solution**: 
  - Clear browser cache (Ctrl+Shift+R)
  - Check GitHub Pages settings
  - Verify deployment completed successfully

#### 4. Build Errors
- **Problem**: Build fails during deployment
- **Solution**: 
  - Run `npm run build` locally first
  - Check for TypeScript errors
  - Ensure all dependencies are installed

---

## 📁 Project Structure

```
project/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── dist/                       # Built files (auto-generated)
├── public/
│   ├── favicon.svg
│   └── .nojekyll              # Prevents Jekyll processing
├── src/
│   ├── components/
│   ├── games/
│   ├── hooks/
│   ├── data/
│   └── ...
├── package.json               # Contains deploy script
├── vite.config.ts            # Base URL configuration
└── DEPLOYMENT_GUIDE.md       # This file
```

---

## 🎯 Best Practices

### Development
1. **Always test locally first**: `npm run dev`
2. **Build before deploying**: `npm run build` (or use `npm run deploy`)
3. **Use meaningful commit messages**
4. **Test in production preview**: `npm run preview`

### Deployment
1. **Use manual deployment** for better control
2. **Check live site** after deployment
3. **Keep this guide updated** with any changes
4. **Document any configuration changes**

---

## 📞 Quick Reference Commands

```bash
# Development
npm install          # Install dependencies
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build

# Deployment
npm run deploy      # Build and deploy to GitHub Pages

# Git workflow
git add .
git commit -m "Your commit message"
git push origin master

# If using GitHub Actions instead:
# Just push to master - deployment happens automatically
```

---

## 🔧 Configuration Files

### vite.config.ts
```typescript
export default defineConfig({
  base: '/Polychordv2/',  // Important for GitHub Pages
  plugins: [react()],
  // ... other config
});
```

### package.json (key parts)
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.3.0"
  }
}
```

---

## 📝 Notes

- **Current Method**: Manual deployment via `gh-pages` package
- **Branch**: Deploys from `master` branch
- **Build Directory**: `dist/` folder
- **Live URL**: https://rogerjs93.github.io/Polychordv2/
- **Last Updated**: July 4, 2025

---

## 🚨 Important Reminders

1. **Always run `npm run deploy`** after making changes
2. **Don't forget to commit your changes** before deploying
3. **Test locally first** to avoid broken deployments
4. **Keep this guide updated** when you make configuration changes

---

*Happy coding! 🎉*
