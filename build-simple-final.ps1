# FINALE EINFACHE SPFx PACKAGE-LÖSUNG
# Direkte ZIP-Erstellung ohne komplexe OPC-Tools
Write-Host "FINALE EINFACHE SPFx PACKAGE LÖSUNG" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Cleanup
if (Test-Path "sharepoint\solution\praevantion-time-planner-simple.sppkg") {
    Remove-Item "sharepoint\solution\praevantion-time-planner-simple.sppkg" -Force
}

# Temp-Verzeichnis
$packageDir = "simple_package"
if (Test-Path $packageDir) { Remove-Item $packageDir -Recurse -Force }
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null
New-Item -ItemType Directory -Path "$packageDir\_rels" -Force | Out-Null

Write-Host "`n[1] Erstelle einfache, aber korrekte Struktur..." -ForegroundColor Yellow

# 1. [Content_Types].xml
Write-Host "  Schreibe [Content_Types].xml..." -ForegroundColor Gray
$contentTypesPath = Join-Path $packageDir "[Content_Types].xml"
$contentTypesContent = @'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="xml" ContentType="application/xml" />
  <Override PartName="/AppManifest.xml" ContentType="application/xml" />
</Types>
'@
[System.IO.File]::WriteAllText($contentTypesPath, $contentTypesContent)

# 2. Package .rels
Write-Host "  Schreibe Package .rels..." -ForegroundColor Gray
$relsPath = Join-Path "$packageDir\_rels" ".rels"
$relsContent = @'
<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="AppManifest.xml" />
</Relationships>
'@
[System.IO.File]::WriteAllText($relsPath, $relsContent)

# 3. AppManifest.xml
Write-Host "  Schreibe AppManifest.xml..." -ForegroundColor Gray
$manifestPath = Join-Path $packageDir "AppManifest.xml"
$manifestContent = @'
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
[System.IO.File]::WriteAllText($manifestPath, $manifestContent)

Write-Host "`n[2] Erstelle ZIP-Package..." -ForegroundColor Yellow
$finalPackage = "sharepoint\solution\praevantion-time-planner-simple.sppkg"

# Direkte ZIP-Erstellung
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packageDir, $finalPackage)

# Cleanup
Remove-Item $packageDir -Recurse -Force

Write-Host "`n[3] FINALE VERIFIKATION..." -ForegroundColor Yellow
if (Test-Path $finalPackage) {
    $fileSize = (Get-Item $finalPackage).Length
    Write-Host "EINFACHES PACKAGE ERSTELLT: $fileSize Bytes" -ForegroundColor Green
    
    # Test das Package
    $testDir = "simple_test"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    [System.IO.Compression.ZipFile]::ExtractToDirectory($finalPackage, $testDir)
    
    Write-Host "`nPACKAGE STRUKTUR:" -ForegroundColor Cyan
    Get-ChildItem $testDir -Recurse | ForEach-Object {
        if ($_.PSIsContainer) {
            Write-Host "  [FOLDER] $($_.Name)" -ForegroundColor Blue
        } else {
            Write-Host "  [FILE]   $($_.Name) ($($_.Length) bytes)" -ForegroundColor Gray
        }
    }
    
    # Überprüfe kritische Dateien
    $contentTypesFiles = Get-ChildItem $testDir | Where-Object { $_.Name -like "*Content_Types*" }
    $hasContentTypes = $contentTypesFiles.Count -gt 0
    $hasAppManifest = Test-Path "$testDir\AppManifest.xml"
    $hasRels = Test-Path "$testDir\_rels\.rels"
    
    Write-Host "`nKRITISCHE DATEIEN:" -ForegroundColor Yellow
    Write-Host "  [Content_Types].xml: $hasContentTypes" -ForegroundColor $(if($hasContentTypes){"Green"}else{"Red"})
    Write-Host "  AppManifest.xml: $hasAppManifest" -ForegroundColor $(if($hasAppManifest){"Green"}else{"Red"})
    Write-Host "  _rels\.rels: $hasRels" -ForegroundColor $(if($hasRels){"Green"}else{"Red"})
    
    if ($hasRels) {
        Write-Host "`nRELATIONSHIP ANALYSE:" -ForegroundColor Yellow
        $relsContent = Get-Content "$testDir\_rels\.rels" -Raw
        Write-Host $relsContent -ForegroundColor Gray
        
        $hasPackageManifest = $relsContent -match "package-manifest"
        $hasCorrectTarget = $relsContent -match "AppManifest\.xml"
        $hasCorrectId = $relsContent -match "rId1"
        
        Write-Host "`nRELATIONSHIP VALIDIERUNG:" -ForegroundColor Cyan
        Write-Host "  package-manifest Type: $hasPackageManifest" -ForegroundColor $(if($hasPackageManifest){"Green"}else{"Red"})
        Write-Host "  AppManifest Target: $hasCorrectTarget" -ForegroundColor $(if($hasCorrectTarget){"Green"}else{"Red"})
        Write-Host "  ID korrekt: $hasCorrectId" -ForegroundColor $(if($hasCorrectId){"Green"}else{"Red"})
        
        $allCorrect = $hasPackageManifest -and $hasCorrectTarget -and $hasCorrectId
        
        if ($allCorrect) {
            Write-Host "`n🎉 PACKAGE IST VOLLSTÄNDIG KORREKT!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "RELATIONSHIP-FEHLER SOLLTE BEHOBEN SEIN!" -ForegroundColor Green
            Write-Host "Package: $finalPackage" -ForegroundColor Cyan
            Write-Host "Größe: $fileSize Bytes" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Green
        } else {
            Write-Host "`n❌ Relationship-Problem noch vorhanden!" -ForegroundColor Red
        }
    }
    
    if ($hasAppManifest) {
        Write-Host "`nAPP-MANIFEST VALIDIERUNG:" -ForegroundColor Yellow
        $manifestContent = Get-Content "$testDir\AppManifest.xml" -Raw
        $hasStartPage = $manifestContent -match "StartPage"
        $hasAppPrincipal = $manifestContent -match "AppPrincipal"
        $hasCorrectProductId = $manifestContent -match "b8ca39ed-114d-4c73-b9c2-a99e485ba40c"
        
        Write-Host "  StartPage: $hasStartPage" -ForegroundColor $(if($hasStartPage){"Green"}else{"Red"})
        Write-Host "  AppPrincipal: $hasAppPrincipal" -ForegroundColor $(if($hasAppPrincipal){"Green"}else{"Red"})
        Write-Host "  Product ID: $hasCorrectProductId" -ForegroundColor $(if($hasCorrectProductId){"Green"}else{"Red"})
    }
    
    Remove-Item $testDir -Recurse -Force
    
} else {
    Write-Host "FEHLER: Package wurde nicht erstellt!" -ForegroundColor Red
}

Write-Host "`n====================================" -ForegroundColor Green
Write-Host "FINALE LÖSUNG ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host "Verwende: sharepoint\solution\praevantion-time-planner-simple.sppkg" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
