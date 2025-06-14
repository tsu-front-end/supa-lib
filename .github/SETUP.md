# GitHub Actions Setup Guide

This document explains how to set up the automated CI/CD workflows for the Supabase Service Manager library.

## Overview

The repository includes two main workflows:

1. **CI Workflow** (`.github/workflows/ci.yml`) - Runs on every push and pull request
2. **Publish Workflow** (`.github/workflows/publish.yml`) - Runs when a GitHub release is published

## Prerequisites

### 1. NPM Token Setup

To enable automated publishing to NPM, you need to set up an NPM access token:

1. **Create NPM Account**: If you don't have one, create an account at [npmjs.com](https://www.npmjs.com)

2. **Generate Access Token**:

   ```bash
   npm login
   npm token create --access=public
   ```

3. **Add Token to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your NPM access token

### 2. GitHub Pages Setup (Optional)

To enable automatic documentation deployment:

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy docs to GitHub Pages on releases

## Workflow Details

### CI Workflow

**Triggers**: Push to main/master/develop branches, Pull requests

**What it does**:

- Tests on Node.js versions 18.x, 20.x, 21.x
- Runs TypeScript type checking
- Performs strict TypeScript validation
- Builds all library formats (ESM, CJS, UMD)
- Generates documentation
- Validates package configuration
- Runs security audit
- Checks for outdated dependencies

### Publish Workflow

**Triggers**: GitHub release published

**What it does**:

- Runs quality checks
- Builds the library
- Generates documentation
- Updates package.json version from release tag
- Publishes to NPM
- Deploys documentation to GitHub Pages
- Adds success comment to GitHub release

## Usage Instructions

### Creating a Release

1. **Update Version**: The workflow automatically sets the version from the Git tag
2. **Create Release**:

   ```bash
   # Create and push a tag
   git tag v1.0.1
   git push origin v1.0.1

   # Or create a release through GitHub UI
   ```

3. **Publish Release**: Go to GitHub → Releases → Create a new release
4. **Automatic Publishing**: The workflow will automatically publish to NPM

### Version Management

The publish workflow supports semantic versioning:

- `v1.0.0` → `1.0.0`
- `v1.0.1` → `1.0.1`
- `1.2.0` → `1.2.0` (with or without 'v' prefix)

### Monitoring Workflows

- **CI Status**: Check the Actions tab for build status on PRs
- **Publish Status**: Monitor release publishing in the Actions tab
- **NPM Package**: Verify publication at `https://www.npmjs.com/package/supabase-service-manager`

## Troubleshooting

### Common Issues

1. **NPM Token Invalid**:

   - Regenerate token: `npm token create --access=public`
   - Update GitHub secret with new token

2. **Build Failures**:

   - Check Node.js version compatibility
   - Verify all dependencies are properly installed
   - Review TypeScript errors in the workflow logs

3. **Publishing Failures**:
   - Ensure package name is available on NPM
   - Check NPM token permissions
   - Verify package.json configuration

### Manual Publishing

If automated publishing fails, you can publish manually:

```bash
npm run build
npm run type-check
npm publish --access public
```

## Security Considerations

- NPM tokens are stored as GitHub secrets (encrypted)
- Workflows only run on specific triggers (releases)
- All builds are isolated in GitHub's secure environment
- Dependencies are cached for faster builds

## Customization

### Modifying CI Checks

Edit `.github/workflows/ci.yml` to:

- Add/remove Node.js versions
- Include additional quality checks
- Modify build validation steps

### Customizing Publishing

Edit `.github/workflows/publish.yml` to:

- Change NPM registry
- Modify version handling
- Add pre/post-publish hooks

## Support

For issues with the workflows:

1. Check the Actions tab for detailed logs
2. Review this setup guide
3. Consult GitHub Actions documentation
4. Open an issue in the repository
