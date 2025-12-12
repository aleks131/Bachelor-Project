# GitHub Repository Configuration Guide

## Current Repository Information

### Repository URL
**Primary URL**: https://github.com/aleks131/Bachelor-Project-

**Alternative URL** (if moved): https://github.com/aleks131/Bachelor-Project.git

## Repository Status

### Check Repository Visibility
1. Go to: https://github.com/aleks131/Bachelor-Project-/settings
2. Scroll to "Danger Zone"
3. Check if repository is **Public** or **Private**

### Make Repository Public (if needed)
1. Go to repository Settings
2. Scroll to "Danger Zone"
3. Click "Change visibility"
4. Select "Make public"
5. Confirm the change

## Fix Git Remote Configuration

### If Repository Was Renamed
```bash
cd "C:\Users\pro13\OneDrive\Desktop\BACHELOR PROJECT\SOFTWARE\UNIFIED-APP"

# Remove old remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/aleks131/Bachelor-Project.git

# Verify
git remote -v

# Push to verify connection
git push -u origin main
```

### Update Existing Remote
```bash
cd "C:\Users\pro13\OneDrive\Desktop\BACHELOR PROJECT\SOFTWARE\UNIFIED-APP"

# Update remote URL
git remote set-url origin https://github.com/aleks131/Bachelor-Project.git

# Verify
git remote -v
```

## Verify Repository Access

### Test Repository Access
1. Open browser: https://github.com/aleks131/Bachelor-Project-
2. Check if you can see the repository
3. Check if you're logged in to GitHub
4. Verify repository visibility (public/private)

### Check Repository Contents
- README.md should be visible
- All code files should be visible
- All documentation should be visible

## For CodeWiki/External Tools

### Repository URL Format
- **HTTPS**: https://github.com/aleks131/Bachelor-Project.git
- **SSH**: git@github.com:aleks131/Bachelor-Project.git

### Required Information
- **Owner**: aleks131
- **Repository Name**: Bachelor-Project- (or Bachelor-Project)
- **Branch**: main
- **Full URL**: https://github.com/aleks131/Bachelor-Project-.git

## Troubleshooting

### Issue: Repository Not Found
**Solution**: 
1. Verify repository exists at GitHub
2. Check repository name (case-sensitive)
3. Ensure repository is public (if using external tools)
4. Verify GitHub username is correct

### Issue: Access Denied
**Solution**:
1. Check if you're logged in to GitHub
2. Verify repository permissions
3. Check if repository is private (make public if needed)

### Issue: Wrong Repository URL
**Solution**:
1. Check actual repository URL on GitHub
2. Update git remote: `git remote set-url origin <correct-url>`
3. Verify: `git remote -v`

## Quick Fix Commands

```bash
# Navigate to project
cd "C:\Users\pro13\OneDrive\Desktop\BACHELOR PROJECT\SOFTWARE\UNIFIED-APP"

# Check current remote
git remote -v

# Update remote URL (if needed)
git remote set-url origin https://github.com/aleks131/Bachelor-Project.git

# Test connection
git fetch origin

# Verify branch
git branch -r
```

## Repository Links

- **Repository**: https://github.com/aleks131/Bachelor-Project-
- **Settings**: https://github.com/aleks131/Bachelor-Project-/settings
- **Code**: https://github.com/aleks131/Bachelor-Project-/tree/main
- **Issues**: https://github.com/aleks131/Bachelor-Project-/issues

---

**Note**: If CodeWiki still can't find the repository, ensure:
1. Repository is **public**
2. Repository name is correct (check for trailing dash)
3. You're using the correct GitHub username
4. Repository actually exists and has content

