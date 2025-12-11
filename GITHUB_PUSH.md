# GitHub Push Instructions

## Complete These Steps:

### 1. First, create the repository on GitHub:
   - Go to: https://github.com/new
   - Repository name: `Ey-Techathon-6.0`
   - Description: Coders Adda Automotive AI - Multi-agent RAG chatbot system
   - Make it Public or Private (your choice)
   - Do NOT initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

### 2. Then run these commands in PowerShell:

```powershell
# Navigate to project directory
cd "c:\Users\Asus\OneDrive\Documents\apna college cpp\automotive-project"

# Remove the temporary remote (if added)
git remote remove origin

# Add your actual GitHub repository URL (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Ey-Techathon-6.0.git

# Verify remote is set correctly
git remote -v

# Set the main branch name
git branch -M main

# Push all files to GitHub
git push -u origin main
```

### 3. Alternative: If you already created the repository, get the URL:
   - Go to your repository on GitHub
   - Click the green "Code" button
   - Copy the HTTPS URL (should look like: https://github.com/YOUR_USERNAME/Ey-Techathon-6.0.git)
   - Run:
     ```powershell
     cd "c:\Users\Asus\OneDrive\Documents\apna college cpp\automotive-project"
     git remote set-url origin YOUR_COPIED_URL
     git push -u origin main
     ```

### 4. If you get authentication errors:
   - GitHub no longer accepts password authentication
   - Use Personal Access Token (PAT) instead:
     1. Go to: https://github.com/settings/tokens
     2. Click "Generate new token (classic)"
     3. Give it a name: "EY Techathon Deployment"
     4. Select scopes: `repo` (full control of private repositories)
     5. Click "Generate token"
     6. Copy the token (you won't see it again!)
     7. When git asks for password, paste the token instead

### 5. Or use GitHub CLI (easier):
```powershell
# Install GitHub CLI (if not installed)
winget install --id GitHub.cli

# Login to GitHub
gh auth login

# Navigate to project
cd "c:\Users\Asus\OneDrive\Documents\apna college cpp\automotive-project"

# Create repository and push
gh repo create "Ey-Techathon-6.0" --public --source=. --remote=origin --push
```

## What's Being Pushed:

✅ All 79 files including:
- Frontend (Next.js app in `web/`)
- Backend (Express server in `server/`)
- RAG Pipeline (embeddings, vector store, LLM clients)
- Multi-agent system (6 worker agents + master orchestrator)
- MongoDB integration (chat history, bookings, feedback, notifications)
- Documentation (README, deployment guide, architecture docs)
- Configuration files (vercel.json, .env.example, tsconfig.json)
- Deployment scripts (deploy.bat, deploy.ps1)

## After Pushing:

1. Your repository will be live at: `https://github.com/YOUR_USERNAME/Ey-Techathon-6.0`
2. You can then deploy to Vercel directly from GitHub
3. Enable GitHub Actions for CI/CD if needed
4. Add collaborators if working in a team

## Troubleshooting:

### "Repository not found"
- Make sure you created the repository on GitHub first
- Check that the repository name matches exactly: `Ey-Techathon-6.0`
- Verify your username in the URL

### "Permission denied"
- Use Personal Access Token instead of password
- Or use `gh auth login` with GitHub CLI

### "Large files detected"
- If you have node_modules accidentally included, run:
  ```powershell
  git rm -r --cached node_modules
  git commit -m "Remove node_modules"
  ```

---

**Ready to push!** Just replace `YOUR_USERNAME` with your actual GitHub username and run the commands above.
