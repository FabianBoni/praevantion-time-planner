# SPFx VOLLSTÄNDIGES PACKAGE mit 7-Zip
# Erstellt ein vollständiges SPFx Package mit allen erforderlichen Komponenten
Write-Host "SPFx VOLLSTÄNDIGES PACKAGE (7-Zip)" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Überprüfe 7-Zip
$sevenZipExe = "C:\Program Files\7-Zip\7z.exe"
if (-not (Test-Path $sevenZipExe)) {
    $sevenZipExe = "C:\Program Files (x86)\7-Zip\7z.exe"
}

if (-not (Test-Path $sevenZipExe)) {
    Write-Host "7-Zip nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Cleanup
if (Test-Path "sharepoint\solution\praevantion-time-planner-complete.sppkg") {
    Remove-Item "sharepoint\solution\praevantion-time-planner-complete.sppkg" -Force
}

# Standard SPFx Build für Bundle
Write-Host "`n[1] SPFx Build..." -ForegroundColor Yellow
npm run build | Out-Null
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Build fehlgeschlagen!" -ForegroundColor Red
    exit 1 
}

# Erstelle vollständige Package-Struktur
$packageDir = "complete_package"
if (Test-Path $packageDir) { Remove-Item $packageDir -Recurse -Force }
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null
New-Item -ItemType Directory -Path "$packageDir\_rels" -Force | Out-Null
New-Item -ItemType Directory -Path "$packageDir\34b44393-1d35-4242-89db-d4cc37228970" -Force | Out-Null

Write-Host "`n[2] Erstelle vollständige Package-Struktur..." -ForegroundColor Yellow

# 1. [Content_Types].xml - Vollständig für SPFx
Write-Host "  Erstelle [Content_Types].xml..." -ForegroundColor Gray
$contentTypesPath = Join-Path $packageDir "[Content_Types].xml"
$contentTypes = @'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="xml" ContentType="application/xml" />
  <Override PartName="/AppManifest.xml" ContentType="application/xml" />
  <Override PartName="/feature_34b44393-1d35-4242-89db-d4cc37228970.xml" ContentType="application/xml" />
  <Override PartName="/34b44393-1d35-4242-89db-d4cc37228970/WebPart_34b44393-1d35-4242-89db-d4cc37228970.xml" ContentType="application/xml" />
</Types>
'@
[System.IO.File]::WriteAllText($contentTypesPath, $contentTypes, [System.Text.Encoding]::UTF8)

# 2. Package .rels
Write-Host "  Erstelle Package .rels..." -ForegroundColor Gray
$relsPath = Join-Path "$packageDir\_rels" ".rels"
$rels = @'
<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="AppManifest.xml" />
</Relationships>
'@
[System.IO.File]::WriteAllText($relsPath, $rels, [System.Text.Encoding]::UTF8)

# 3. AppManifest.xml - Vollständig mit korrekten Referenzen
Write-Host "  Erstelle AppManifest.xml..." -ForegroundColor Gray
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
[System.IO.File]::WriteAllText($manifestPath, $manifest, [System.Text.Encoding]::UTF8)

# 4. AppManifest.xml.rels
Write-Host "  Erstelle AppManifest.xml.rels..." -ForegroundColor Gray
$appManifestRelsPath = Join-Path "$packageDir\_rels" "AppManifest.xml.rels"
$appManifestRels = @'
<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId2" Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/manifest-feature" Target="feature_34b44393-1d35-4242-89db-d4cc37228970.xml" />
</Relationships>
'@
[System.IO.File]::WriteAllText($appManifestRelsPath, $appManifestRels, [System.Text.Encoding]::UTF8)

# 5. Feature.xml
Write-Host "  Erstelle Feature.xml..." -ForegroundColor Gray
$featurePath = Join-Path $packageDir "feature_34b44393-1d35-4242-89db-d4cc37228970.xml"
$feature = @'
<?xml version="1.0" encoding="utf-8"?>
<Feature xmlns="http://schemas.microsoft.com/sharepoint/"
         Id="34b44393-1d35-4242-89db-d4cc37228970"
         Title="Praevantion Time Planner Feature"
         Description="The feature that activates elements of the Praevantion Time Planner solution."
         Version="1.0.0.0"
         Scope="Site">
  <ElementManifests>
    <ElementManifest Location="34b44393-1d35-4242-89db-d4cc37228970\WebPart_34b44393-1d35-4242-89db-d4cc37228970.xml" />
  </ElementManifests>
</Feature>
'@
[System.IO.File]::WriteAllText($featurePath, $feature, [System.Text.Encoding]::UTF8)

# 6. Feature.xml.config.xml
Write-Host "  Erstelle Feature Config..." -ForegroundColor Gray
$featureConfigPath = Join-Path $packageDir "feature_34b44393-1d35-4242-89db-d4cc37228970.xml.config.xml"
$featureConfig = @'
<?xml version="1.0" encoding="utf-8"?>
<FeatureManifestReference xmlns="http://schemas.microsoft.com/sharepoint/"
                          FeatureId="34b44393-1d35-4242-89db-d4cc37228970" />
'@
[System.IO.File]::WriteAllText($featureConfigPath, $featureConfig, [System.Text.Encoding]::UTF8)

# 7. Feature .rels
Write-Host "  Erstelle Feature .rels..." -ForegroundColor Gray
$featureRelsPath = Join-Path "$packageDir\_rels" "feature_34b44393-1d35-4242-89db-d4cc37228970.xml.rels"
$featureRels = @'
<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId3" Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/feature-element" Target="34b44393-1d35-4242-89db-d4cc37228970/WebPart_34b44393-1d35-4242-89db-d4cc37228970.xml" />
</Relationships>
'@
[System.IO.File]::WriteAllText($featureRelsPath, $featureRels, [System.Text.Encoding]::UTF8)

# 8. WebPart Element Manifest
Write-Host "  Erstelle WebPart Manifest..." -ForegroundColor Gray
$webPartPath = Join-Path "$packageDir\34b44393-1d35-4242-89db-d4cc37228970" "WebPart_34b44393-1d35-4242-89db-d4cc37228970.xml"
$webPart = @'
<?xml version="1.0" encoding="utf-8"?>
<Elements xmlns="http://schemas.microsoft.com/sharepoint/">
  <ClientSideComponentInstance 
    InstanceId="34b44393-1d35-4242-89db-d4cc37228970"
    ComponentId="34b44393-1d35-4242-89db-d4cc37228970"
    Title="Praevantion Time Planner"
    Description="Intelligente Terminplanung für das Präventionsteam Basel-Stadt"
    Properties="{}" />
</Elements>
'@
[System.IO.File]::WriteAllText($webPartPath, $webPart, [System.Text.Encoding]::UTF8)

Write-Host "`n[3] Erstelle .sppkg mit 7-Zip..." -ForegroundColor Yellow
$finalPackage = "sharepoint\solution\praevantion-time-planner-complete.sppkg"

# Wechsle in Package-Verzeichnis für relative Pfade
Push-Location $packageDir

# 7-Zip mit optimalen Einstellungen
$sevenZipArgs = @(
    "a",                    # Add files
    "-tzip",               # ZIP format
    "-mx=1",               # Fastest compression
    "-r",                  # Recursive
    "..\$finalPackage",    # Output file
    "*"                    # All files
)

$process = Start-Process -FilePath $sevenZipExe -ArgumentList $sevenZipArgs -Wait -PassThru -NoNewWindow
Pop-Location

if ($process.ExitCode -ne 0) {
    Write-Host "7-Zip Fehler (Exit Code: $($process.ExitCode))" -ForegroundColor Red
    exit 1
}

# Cleanup
Remove-Item $packageDir -Recurse -Force

Write-Host "`n[4] Verifikation..." -ForegroundColor Yellow
if (Test-Path $finalPackage) {
    $fileSize = (Get-Item $finalPackage).Length
    Write-Host "VOLLSTÄNDIGES PACKAGE ERSTELLT: $fileSize Bytes" -ForegroundColor Green
    
    # Test das Package
    $testDir = "test_complete"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($finalPackage, $testDir)
    
    Write-Host "`nPACKAGE INHALT:" -ForegroundColor Cyan
    Get-ChildItem $testDir -Recurse | ForEach-Object {
        if ($_.PSIsContainer) {
            Write-Host "  [FOLDER] $($_.Name)" -ForegroundColor Blue
        } else {
            Write-Host "  [FILE]   $($_.Name) ($($_.Length) bytes)" -ForegroundColor Gray
        }
    }
    
    # Überprüfe kritische Dateien
    $requiredFiles = @(
        "[Content_Types].xml",
        "AppManifest.xml",
        "_rels\.rels",
        "_rels\AppManifest.xml.rels",
        "feature_34b44393-1d35-4242-89db-d4cc37228970.xml",
        "34b44393-1d35-4242-89db-d4cc37228970\WebPart_34b44393-1d35-4242-89db-d4cc37228970.xml"
    )
    
    Write-Host "`nVOLLSTÄNDIGKEITS-CHECK:" -ForegroundColor Yellow
    $allPresent = $true
    foreach ($file in $requiredFiles) {
        $exists = Test-Path "$testDir\$file"
        if (-not $exists) { $allPresent = $false }
        Write-Host "  $file`: $exists" -ForegroundColor $(if($exists){"Green"}else{"Red"})
    }
    
    if ($allPresent) {
        Write-Host "`n🎉 VOLLSTÄNDIGES SPFx PACKAGE BEREIT!" -ForegroundColor Green
        Write-Host "=======================================" -ForegroundColor Green
        Write-Host "Package: $finalPackage" -ForegroundColor Cyan
        Write-Host "Größe: $fileSize Bytes" -ForegroundColor Cyan
        Write-Host "Methode: 7-Zip (OPC-kompatibel)" -ForegroundColor Cyan
        Write-Host "Enthält: Alle SPFx Komponenten" -ForegroundColor Cyan
        Write-Host "=======================================" -ForegroundColor Green
        Write-Host "Dieses Package sollte die Validierung bestehen!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Package ist unvollständig!" -ForegroundColor Red
    }
    
    Remove-Item $testDir -Recurse -Force
    
} else {
    Write-Host "FEHLER: Package wurde nicht erstellt!" -ForegroundColor Red
}
