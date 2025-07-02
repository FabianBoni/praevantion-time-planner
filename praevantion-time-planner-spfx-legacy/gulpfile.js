'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

build.tslint.enabled = false;

// Function to replace manifest with classic version
function replaceWithClassicManifest() {
  const manifestPath = path.join(__dirname, 'sharepoint', 'solution', 'debug', 'AppManifest.xml');
  
  if (fs.existsSync(manifestPath)) {
    const classicManifest = `<?xml version="1.0" encoding="utf-8"?>
<App xmlns="http://schemas.microsoft.com/sharepoint/2012/app/manifest" 
     Name="praevantion-time-planner-client-side-solution" 
     ProductID="2d44dabb-53b4-40cb-97d1-b2124750348f" 
     Version="1.0.0.2" 
     SharePointMinVersion="16.0.0.0">
  <Properties>
    <Title>praevantion-time-planner-client-side-solution</Title>
    <StartPage>~appWebUrl/Pages/Default.aspx</StartPage>
  </Properties>
  <AppPrincipal>
    <Internal />
  </AppPrincipal>
  <AppPermissionRequests>
    <AppPermissionRequest Scope="http://sharepoint/content/sitecollection/web" Right="Read" />
  </AppPermissionRequests>
</App>`;
    
    fs.writeFileSync(manifestPath, classicManifest);
    console.log('🔧 AppManifest.xml replaced with classic format');
    return true;
  }
  return false;
}

// Function to create ZIP using PowerShell
function createZipWithPowerShell(sourcePath, destPath) {
  return new Promise((resolve, reject) => {
    const powershellCommand = `Compress-Archive -Path "${sourcePath}\\*" -DestinationPath "${destPath}" -Force`;
    
    const ps = spawn('powershell.exe', ['-Command', powershellCommand], {
      cwd: path.dirname(sourcePath)
    });
    
    ps.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`PowerShell command failed with code ${code}`));
      }
    });
    
    ps.on('error', (err) => {
      reject(err);
    });
  });
}

// Custom task that builds and fixes manifest in one go
gulp.task('package-classic', ['package-solution'], function(done) {
  console.log('📦 Fixing manifest and creating new package...');
  
  setTimeout(() => {
    // Replace the manifest
    replaceWithClassicManifest();
    
    // Get paths
    const debugDir = path.join(__dirname, 'sharepoint', 'solution', 'debug');
    const solutionDir = path.join(__dirname, 'sharepoint', 'solution');
    const packagePath = path.join(solutionDir, 'praevantion-time-planner-classic.zip');
    
    // Create new package with fixed manifest using PowerShell
    createZipWithPowerShell(debugDir, packagePath)
      .then(() => {
        console.log('✅ New package created: praevantion-time-planner-classic.sppkg');
        console.log('🚀 Package ready for deployment!');
        done();
      })
      .catch((err) => {
        console.error('❌ Failed to create package:', err.message);
        done(err);
      });
  }, 1000); // Wait for package-solution to complete
});

// Custom task to fix AppManifest.xml manually (fallback)
gulp.task('fix-manifest-manual', () => {
  return new Promise((resolve, reject) => {
    if (replaceWithClassicManifest()) {
      console.log('📦 Next step: Go to sharepoint/solution/debug and manually run:');
      console.log('   Compress-Archive -Path ".\\*" -DestinationPath "..\\praevantion-final-working.zip" -Force');
      resolve();
    } else {
      reject(new Error('AppManifest.xml not found'));
    }
  });
});

build.initialize(gulp);
