# Finales SPFx Package mit korrigiertem App-Manifest
Write-Host "SPFx 1.1.0 - Finale Package-Erstellung" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Cleanup
$packages = @(
    "sharepoint\solution\praevantion-time-planner-final.sppkg",
    "sharepoint\solution\praevantion-time-planner-corrected.sppkg"
)
foreach ($pkg in $packages) {
    if (Test-Path $pkg) { 
        Remove-Item $pkg -Force -ErrorAction SilentlyContinue
    }
}

# 1. Standard Build und Package
Write-Host "`n[1] SPFx Build und Package..." -ForegroundColor Yellow
npm run build | Out-Null
if ($LASTEXITCODE -ne 0) { exit 1 }

gulp package-solution | Out-Null
if ($LASTEXITCODE -ne 0) { exit 1 }

# 2. Korrigiere das AppManifest.xml nach dem Build
Write-Host "`n[2] Korrigiere App-Manifest..." -ForegroundColor Yellow

$manifestPath = "sharepoint\solution\debug\AppManifest.xml"
$correctManifest = @'
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

$correctManifest | Out-File $manifestPath -Encoding UTF8 -NoNewline

# 3. Stelle sicher, dass Content_Types.xml vorhanden ist
$contentTypesPath = "sharepoint\solution\debug\[Content_Types].xml"
if (-not (Test-Path $contentTypesPath)) {
    Write-Host "Erstelle [Content_Types].xml..." -ForegroundColor Yellow
    $contentTypes = @'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="text/xml" />
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
</Types>
'@
    $contentTypes | Out-File $contentTypesPath -Encoding UTF8 -NoNewline
}

# 4. Erstelle finales Package aus korrigierten Dateien
Write-Host "`n[3] Erstelle finales Package..." -ForegroundColor Yellow

$sourceDir = "sharepoint\solution\debug"
$finalPackage = "sharepoint\solution\praevantion-time-planner-corrected.sppkg"

# Temp-Verzeichnis für korrigiertes Package
$tempDir = "temp_corrected_package"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Kopiere alle Dateien aus debug
Copy-Item "$sourceDir\*" $tempDir -Recurse -Force

# Erstelle korrekte package-level .rels
$packageRelsContent = @'
<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="/AppManifest.xml" Id="R1" />
</Relationships>
'@
$packageRelsContent | Out-File "$tempDir\_rels\.rels" -Encoding UTF8 -NoNewline

# Erstelle ZIP-Package
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $finalPackage)

# Cleanup
Remove-Item $tempDir -Recurse -Force

# 5. Finale Verifikation
if (Test-Path $finalPackage) {
    $fileSize = (Get-Item $finalPackage).Length
    Write-Host "`n[4] ERFOLGREICH!" -ForegroundColor Green
    Write-Host "Package: $finalPackage ($fileSize Bytes)" -ForegroundColor Green
    
    # Detaillierte Verifikation
    Write-Host "`n[5] Detaillierte Verifikation..." -ForegroundColor Yellow
    $testDir = "verification_test"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    try {
        [System.IO.Compression.ZipFile]::ExtractToDirectory($finalPackage, $testDir)
        
        # Prüfe Struktur
        $hasContentTypes = Test-Path "$testDir\[Content_Types].xml"
        $hasAppManifest = Test-Path "$testDir\AppManifest.xml"
        $hasPackageRels = Test-Path "$testDir\_rels\.rels"
        $hasAppManifestRels = Test-Path "$testDir\_rels\AppManifest.xml.rels"
        
        Write-Host "Struktur:" -ForegroundColor Cyan
        Write-Host "  [Content_Types].xml: $hasContentTypes" -ForegroundColor $(if($hasContentTypes){"Green"}else{"Red"})
        Write-Host "  AppManifest.xml: $hasAppManifest" -ForegroundColor $(if($hasAppManifest){"Green"}else{"Red"})
        Write-Host "  _rels\.rels: $hasPackageRels" -ForegroundColor $(if($hasPackageRels){"Green"}else{"Red"})
        Write-Host "  _rels\AppManifest.xml.rels: $hasAppManifestRels" -ForegroundColor $(if($hasAppManifestRels){"Green"}else{"Red"})
        
        # Prüfe Manifest-Inhalte
        if ($hasAppManifest) {
            $manifestContent = Get-Content "$testDir\AppManifest.xml" -Raw
            $hasStartPage = $manifestContent -match "StartPage"
            $hasAppPrincipal = $manifestContent -match "AppPrincipal"
            $hasTitle = $manifestContent -match "Praevantion Time Planner"
            
            Write-Host "`nApp-Manifest:" -ForegroundColor Cyan
            Write-Host "  StartPage: $hasStartPage" -ForegroundColor $(if($hasStartPage){"Green"}else{"Red"})
            Write-Host "  AppPrincipal: $hasAppPrincipal" -ForegroundColor $(if($hasAppPrincipal){"Green"}else{"Red"})
            Write-Host "  Titel: $hasTitle" -ForegroundColor $(if($hasTitle){"Green"}else{"Red"})
        }
        
        # Prüfe Relationships
        if ($hasPackageRels) {
            $relsContent = Get-Content "$testDir\_rels\.rels" -Raw
            $hasPackageManifestRel = $relsContent -match "package-manifest"
            
            Write-Host "`nRelationships:" -ForegroundColor Cyan
            Write-Host "  package-manifest: $hasPackageManifestRel" -ForegroundColor $(if($hasPackageManifestRel){"Green"}else{"Red"})
        }
        
        # Zusammenfassung
        $allGood = $hasContentTypes -and $hasAppManifest -and $hasPackageRels -and $hasAppManifestRels
        if ($allGood) {
            Write-Host "`nPACKAGE IST SHAREPOINT-BEREIT!" -ForegroundColor Green
            Write-Host "Pfad: $finalPackage" -ForegroundColor Green
            Write-Host "Groesse: $fileSize Bytes" -ForegroundColor Green
        } else {
            Write-Host "`nPackage hat noch Probleme!" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "Fehler bei Verifikation: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        if (Test-Path $testDir) {
            Remove-Item $testDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
} else {
    Write-Host "FEHLER: Package wurde nicht erstellt!" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "FINALE SPFx-LOESUNG ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host "Package bereit fuer SharePoint App-Katalog" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
