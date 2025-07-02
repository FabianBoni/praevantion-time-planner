# SPFx 1.1.0 MINIMAL KORREKTE PACKAGE-STRUKTUR
# Erstellt ein absolut minimales, aber SharePoint-kompatibles Package
Write-Host "SPFx 1.1.0 MINIMAL PACKAGE CREATION" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Cleanup
$packages = @(
    "sharepoint\solution\praevantion-time-planner-minimal.sppkg",
    "sharepoint\solution\praevantion-time-planner-working.sppkg"
)
foreach ($pkg in $packages) {
    if (Test-Path $pkg) { Remove-Item $pkg -Force -ErrorAction SilentlyContinue }
}

# Temp-Verzeichnis für minimales Package
$packageDir = "minimal_package_structure"
if (Test-Path $packageDir) { Remove-Item $packageDir -Recurse -Force }
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null
New-Item -ItemType Directory -Path "$packageDir\_rels" -Force | Out-Null

Write-Host "`n[1] Erstelle minimale Package-Struktur..." -ForegroundColor Yellow

# 1. [Content_Types].xml - MINIMAL aber KORREKT
Write-Host "  Erstelle [Content_Types].xml..." -ForegroundColor Gray
$contentTypesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/AppManifest.xml" ContentType="application/xml"/>
</Types>
"@
[System.IO.File]::WriteAllText("$packageDir\[Content_Types].xml", $contentTypesXml, [System.Text.Encoding]::UTF8)

# 2. Package-level .rels - KORREKTE Referenz
Write-Host "  Erstelle Package .rels..." -ForegroundColor Gray
$packageRelsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="AppManifest.xml"/>
</Relationships>
"@
[System.IO.File]::WriteAllText("$packageDir\_rels\.rels", $packageRelsXml, [System.Text.Encoding]::UTF8)

# 3. AppManifest.xml - MINIMAL aber VOLLSTÄNDIG
Write-Host "  Erstelle AppManifest.xml..." -ForegroundColor Gray
$appManifestXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
        <Internal AllowedRemoteHostUrl="*"/>
    </AppPrincipal>
</App>
"@
[System.IO.File]::WriteAllText("$packageDir\AppManifest.xml", $appManifestXml, [System.Text.Encoding]::UTF8)

Write-Host "`n[2] Erstelle Package..." -ForegroundColor Yellow
$finalPackage = "sharepoint\solution\praevantion-time-planner-minimal.sppkg"

# Erstelle ZIP mit System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packageDir, $finalPackage)

# Cleanup
Remove-Item $packageDir -Recurse -Force

Write-Host "`n[3] Verifikation..." -ForegroundColor Yellow
if (Test-Path $finalPackage) {
    $fileSize = (Get-Item $finalPackage).Length
    Write-Host "MINIMAL PACKAGE ERSTELLT: $fileSize Bytes" -ForegroundColor Green
    
    # Test das Package
    $testDir = "minimal_test"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    [System.IO.Compression.ZipFile]::ExtractToDirectory($finalPackage, $testDir)
    
    # Überprüfe Dateien
    $files = @(
        "[Content_Types].xml",
        "_rels\.rels", 
        "AppManifest.xml"
    )
    
    Write-Host "`nSTRUKTUR-CHECK:" -ForegroundColor Cyan
    foreach ($file in $files) {
        $exists = Test-Path "$testDir\$file"
        Write-Host "  $file`: $exists" -ForegroundColor $(if($exists){"Green"}else{"Red"})
    }
    
    # Überprüfe .rels Inhalt
    $relsContent = Get-Content "$testDir\_rels\.rels" -Raw
    $hasPackageManifest = $relsContent -match "package-manifest"
    $hasTargetAppManifest = $relsContent -match "Target=`"AppManifest.xml`""
    
    Write-Host "`nRELATIONSHIP-CHECK:" -ForegroundColor Cyan
    Write-Host "  package-manifest: $hasPackageManifest" -ForegroundColor $(if($hasPackageManifest){"Green"}else{"Red"})
    Write-Host "  Target AppManifest: $hasTargetAppManifest" -ForegroundColor $(if($hasTargetAppManifest){"Green"}else{"Red"})
    
    # Zeige .rels Inhalt
    Write-Host "`n.RELS INHALT:" -ForegroundColor Yellow
    Write-Host $relsContent -ForegroundColor Gray
    
    if ($hasPackageManifest -and $hasTargetAppManifest) {
        Write-Host "`n✅ MINIMAL PACKAGE IST KORREKT!" -ForegroundColor Green
        Write-Host "Teste dieses Package in SharePoint!" -ForegroundColor Green
        Write-Host "Package: $finalPackage" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Package hat noch Probleme!" -ForegroundColor Red
    }
    
    Remove-Item $testDir -Recurse -Force
} else {
    Write-Host "FEHLER: Package wurde nicht erstellt!" -ForegroundColor Red
}

Write-Host "`n====================================" -ForegroundColor Green
Write-Host "MINIMAL PACKAGE ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "Verwende: sharepoint\solution\praevantion-time-planner-minimal.sppkg" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
