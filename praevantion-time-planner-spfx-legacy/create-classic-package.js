const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Create a completely manual classic SharePoint App package
function createClassicPackage() {
  const packageDir = path.join(__dirname, 'classic-package');
  const outputPath = path.join(__dirname, 'sharepoint', 'solution', 'praevantion-classic-manual.zip');
  
  // Clean up (Node 10 compatible)
  if (fs.existsSync(packageDir)) {
    const rimraf = require('rimraf');
    rimraf.sync(packageDir);
  }
  fs.mkdirSync(packageDir, { recursive: true });
  
  // Create the classic manifest
  const classicManifest = `<?xml version="1.0" encoding="utf-8"?>
<App xmlns="http://schemas.microsoft.com/sharepoint/2012/app/manifest" 
     Name="praevantion-time-planner-client-side-solution" 
     ProductID="2d44dabb-53b4-40cb-97d1-b2124750348f" 
     Version="1.0.0.3" 
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

  // Create [Content_Types].xml
  const contentTypes = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml" />
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="js" ContentType="application/javascript" />
</Types>`;

  // Create _rels/.rels with the critical relationship
  const mainRels = `<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="/AppManifest.xml" Id="R1" />
</Relationships>`;

  // Write files
  fs.writeFileSync(path.join(packageDir, 'AppManifest.xml'), classicManifest);
  fs.writeFileSync(path.join(packageDir, '[Content_Types].xml'), contentTypes);
  
  const relsDir = path.join(packageDir, '_rels');
  fs.mkdirSync(relsDir, { recursive: true });
  fs.writeFileSync(path.join(relsDir, '.rels'), mainRels);
  
  // Copy the built JavaScript file if it exists
  const builtJsPath = path.join(__dirname, 'dist', 'praevention-timeplaner-web-part.js');
  if (fs.existsSync(builtJsPath)) {
    fs.copyFileSync(builtJsPath, path.join(packageDir, 'praevention-timeplaner-web-part.js'));
    console.log('✅ Copied built JavaScript file');
  } else {
    console.log('⚠️  Built JS file not found, creating minimal classic app');
  }
  
  // Create ZIP using PowerShell
  return new Promise((resolve, reject) => {
    const powershellCommand = `Compress-Archive -Path "${packageDir}\\*" -DestinationPath "${outputPath}" -Force`;
    
    const ps = spawn('powershell.exe', ['-Command', powershellCommand]);
    
    ps.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Classic package created: ${outputPath}`);
        resolve(outputPath);
      } else {
        reject(new Error(`PowerShell command failed with code ${code}`));
      }
    });
    
    ps.on('error', (err) => {
      reject(err);
    });
  });
}

// Run if called directly
if (require.main === module) {
  createClassicPackage()
    .then((path) => {
      console.log('🎉 Success! Upload this file to SharePoint:');
      console.log(path);
      console.log('');
      console.log('This is a manually crafted classic SharePoint App package');
      console.log('that should pass both manifest and relationship validation.');
    })
    .catch((err) => {
      console.error('❌ Error:', err.message);
    });
}

module.exports = { createClassicPackage };
