
# Initialize clean repository
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
git init

# Configure user if needed (optional, uses system default usually)
# git config user.name "Hariharan R"
# git config user.email "hariharan.r06@gmail.com" 

# 1. Root Configuration
git add package.json
git commit -m "Initialize project structure"

git add vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json
git commit -m "Add TypeScript and build configuration"

git add tailwind.config.ts postcss.config.js components.json
git commit -m "Add styling and UI configuration"

git add .gitignore README.md bun.lockb package-lock.json eslint.config.js
git commit -m "Add project documentation and lock files"

# 2. Public Assets
git add public/
git commit -m "Add public assets"

# 3. Backend Structure
git add backend/config/
git commit -m "Add backend configuration"

git add backend/database/
git commit -m "Add database schema and migrations"

git add backend/middleware/
git commit -m "Add authentication middleware"

# 4. Backend Routes (Individual Commits)
$backendRoutes = Get-ChildItem -Path "backend/routes" -File
foreach ($file in $backendRoutes) {
    git add $file.FullName
    git commit -m "Add backend route: $($file.Name)"
}

# 5. Backend Server
git add backend/server.js backend/package.json backend/package-lock.json
git commit -m "Add backend server and dependencies"

# 6. Source Code - Core
git add src/main.tsx src/index.css src/vite-env.d.ts
git commit -m "Add React entry point and global styles"

git add src/App.tsx
git commit -m "Add main App component and routing"

# 7. Source Code - Utils & Libs (Individual)
$utils = Get-ChildItem -Path "src/lib", "src/utils", "src/hooks" -Recurse -File
foreach ($file in $utils) {
    git add $file.FullName
    git commit -m "Add utility: $($file.Name)"
}

# 8. Source Code - Context (Individual)
$context = Get-ChildItem -Path "src/context" -File
foreach ($file in $context) {
    git add $file.FullName
    git commit -m "Add context provider: $($file.Name)"
}

# 9. Source Code - UI Components (Individual)
$uiComponents = Get-ChildItem -Path "src/components/ui" -File
foreach ($file in $uiComponents) {
    git add $file.FullName
    git commit -m "Add UI component: $($file.Name)"
}

# 10. Source Code - Feature Components (Individual)
$components = Get-ChildItem -Path "src/components" -File
foreach ($file in $components) {
    git add $file.FullName
    git commit -m "Add component: $($file.Name)"
}

# 11. Source Code - Pages (Individual)
$pages = Get-ChildItem -Path "src/pages" -File
foreach ($file in $pages) {
    git add $file.FullName
    git commit -m "Add page: $($file.Name)"
}

# 12. Remainder
git add .
git commit -m "Finalize project setup"

# Push to new remote
git remote add origin https://github.com/hariharan-r06/StarMobilesWebsite.git
git branch -M main
# Note: Push might require authentication if credentials aren't cached
git push -u origin main
