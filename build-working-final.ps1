# FINALE EINFACHE SPFx PACKAGE-LÖSUNG
Write-Host "FINALE EINFACHE SPFx PACKAGE LÖSUNG" -ForegroundColor Green

# Cleanup
if (Test-Path "sharepoint\solution\praevantion-time-planner-simple.sppkg") {
    Remove-Item "sharepoint\solution\praevantion-time-planner-simple.sppkg" -Force
}

# Temp-Verzeichnis
$packageDir = "simple_package"
if (Test-Path $packageDir) { Remove-Item $packageDir -Recurse -Force }
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null
New-Item -ItemType Directory -Path "$packageDir\_rels" -Force | Out-Null

Write-Host "Erstelle Package-Struktur..." -ForegroundColor Yellow

# Content_Types.xml
$contentTypesPath = Join-Path $packageDir "[Content_Types].xml"
$contentTypes = @'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="xml" ContentType="application/xml" />
  <Override PartName="/AppManifest.xml" ContentType="application/xml" />
</Types>
'@
[System.IO.File]::WriteAllText($contentTypesPath, $contentTypes)

# Package .rels
$relsPath = Join-Path "$packageDir\_rels" ".rels"
$rels = @'
<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="AppManifest.xml" />
</Relationships>
'@
[System.IO.File]::WriteAllText($relsPath, $rels)

# AppManifest.xml
$manifestPath = Join-Path $packageDir "AppManifest.xml"
$manifest = @'
<?xml version="1.0" encoding="utf-8"?>
<App xmlns="http://schemas.microsoft.com/sharepoint/2012/app/manifest"
     Name="praevantion-time-planner-client-side-solution"
     ProductID="b8ca39ed-114d-4c73-b9c2-a99e485ba40c"
     Version="1.0.0.0"
     SharePointMinVersion="16.0.0.0"
     IsClientSideSolution="true"
     SkipFeatureDeployment="true">
  <Properties>
    <Title>Praevantion Time Planner</Title>
    <StartPage>~appWebUrl/Lists/SitePages/Home.aspx</StartPage>
  </Properties>
  <AppPrincipal>
    <Internal AllowedRemoteHostUrl="*" />
  </AppPrincipal>
</App>
'@
[System.IO.File]::WriteAllText($manifestPath, $manifest)

Write-Host "Erstelle ZIP-Package..." -ForegroundColor Yellow
$finalPackage = "sharepoint\solution\praevantion-time-planner-simple.sppkg"

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packageDir, $finalPackage)

Remove-Item $packageDir -Recurse -Force

# Verifikation
if (Test-Path $finalPackage) {
    $fileSize = (Get-Item $finalPackage).Length
    Write-Host "PACKAGE ERSTELLT: $fileSize Bytes" -ForegroundColor Green
    
    $testDir = "simple_test"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    [System.IO.Compression.ZipFile]::ExtractToDirectory($finalPackage, $testDir)
    
    $contentTypesFiles = Get-ChildItem $testDir | Where-Object { $_.Name -like "*Content_Types*" }
    $hasContentTypes = $contentTypesFiles.Count -gt 0
    $hasAppManifest = Test-Path "$testDir\AppManifest.xml"
    $hasRels = Test-Path "$testDir\_rels\.rels"
    
    Write-Host "STRUKTUR-CHECK:" -ForegroundColor Cyan
    Write-Host "  [Content_Types].xml: $hasContentTypes" -ForegroundColor $(if($hasContentTypes){"Green"}else{"Red"})
    Write-Host "  AppManifest.xml: $hasAppManifest" -ForegroundColor $(if($hasAppManifest){"Green"}else{"Red"})
    Write-Host "  _rels\.rels: $hasRels" -ForegroundColor $(if($hasRels){"Green"}else{"Red"})
    
    if ($hasRels) {
        $relsContent = Get-Content "$testDir\_rels\.rels" -Raw
        $hasPackageManifest = $relsContent -match "package-manifest"
        $hasCorrectTarget = $relsContent -match "AppManifest\.xml"
        
        Write-Host "RELATIONSHIP-CHECK:" -ForegroundColor Cyan
        Write-Host "  package-manifest: $hasPackageManifest" -ForegroundColor $(if($hasPackageManifest){"Green"}else{"Red"})
        Write-Host "  Target korrekt: $hasCorrectTarget" -ForegroundColor $(if($hasCorrectTarget){"Green"}else{"Red"})
        
        if ($hasPackageManifest -and $hasCorrectTarget) {
            Write-Host "PACKAGE IST KORREKT!" -ForegroundColor Green
            Write-Host "Package: $finalPackage" -ForegroundColor Cyan
        }
    }
    
    Remove-Item $testDir -Recurse -Force
}
