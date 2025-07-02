'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const fs = require('fs');
const path = require('path');

build.tslint.enabled = false;

// Custom task to fix AppManifest.xml and repackage manually
gulp.task('fix-manifest-manual', () => {
  return new Promise((resolve, reject) => {
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
      console.log('✅ AppManifest.xml updated to classic format');
      console.log('📦 Next step: Go to sharepoint/solution/debug and manually run:');
      console.log('   Compress-Archive -Path ".\\*" -DestinationPath "..\\praevantion-final-working.zip" -Force');
      
      resolve();
    } else {
      reject(new Error('AppManifest.xml not found'));
    }
  });
});

build.initialize(gulp);
