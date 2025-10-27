# GitHub Pages Configuration

This project is configured to deploy to GitHub Pages using GitHub Actions.

## Deployment Methods

1. **Primary**: Modern GitHub Pages Actions (recommended)
   - Uses `actions/configure-pages@v4`
   - Uses `actions/upload-pages-artifact@v3`
   - Uses `actions/deploy-pages@v4`

2. **Alternative**: Traditional method
   - Uses `peaceiris/actions-gh-pages@v3`
   - Fallback option if primary method fails

## Required Settings

Make sure these are configured in your GitHub repository:

1. **Pages Settings**:
   - Go to Settings → Pages
   - Source: "GitHub Actions"
   - Environment: "github-pages"

2. **Permissions**:
   - Contents: Read
   - Pages: Write
   - ID Token: Write

3. **Environment**:
   - Environment name: "github-pages"
   - Protection rules: None (for public repos)

## Troubleshooting

If GitHub Actions fails:

1. Check repository permissions
2. Verify Pages settings
3. Use alternative deployment method
4. Check Actions logs for specific errors