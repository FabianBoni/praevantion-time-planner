# SPFx Package mit 7-Zip - OPC-Kompatible Lösung
# Basierend auf Ihrer Entdeckung bzgl. Compress-Archive vs 7-Zip
Write-Host "SPFx Package mit 7-Zip (OPC-Kompatibel)" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Überprüfe 7-Zip Installation
$sevenZipPaths = @(
    "C:\Program Files\7-Zip\7z.exe",
    "C:\Program Files (x86)\7-Zip\7z.exe",
    "${env:ProgramFiles}\7-Zip\7z.exe",
    "${env:ProgramFiles(x86)}\7-Zip\7z.exe"
)

$sevenZipExe = $null
foreach ($path in $sevenZipPaths) {
    if (Test-Path $path) {
        $sevenZipExe = $path
        break
    }
}

if (-not $sevenZipExe) {
    Write-Host "7-Zip nicht gefunden. Versuche Alternative..." -ForegroundColor Yellow
    
    # Alternative: PowerShell Archive Update
    Write-Host "Aktualisiere PowerShell Archive Modul..." -ForegroundColor Yellow
    try {
        Install-Module Microsoft.PowerShell.Archive -MinimumVersion 1.2.3.0 -Force -Scope CurrentUser
        Import-Module Microsoft.PowerShell.Archive -Force
        Write-Host "PowerShell Archive Modul aktualisiert!" -ForegroundColor Green
        $useUpdatedPowerShell = $true
    } catch {
        Write-Host "Fehler beim Update: $($_.Exception.Message)" -ForegroundColor Red
        $useUpdatedPowerShell = $false
    }
} else {
    Write-Host "7-Zip gefunden: $sevenZipExe" -ForegroundColor Green
    $useUpdatedPowerShell = $false
}

# Cleanup
if (Test-Path "sharepoint\solution\praevantion-time-planner-7zip.sppkg") {
    Remove-Item "sharepoint\solution\praevantion-time-planner-7zip.sppkg" -Force
}

# Erstelle Package-Struktur
$packageDir = "package_7zip"
if (Test-Path $packageDir) { Remove-Item $packageDir -Recurse -Force }
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null
New-Item -ItemType Directory -Path "$packageDir\_rels" -Force | Out-Null

Write-Host "`n[1] Erstelle korrekte Package-Struktur..." -ForegroundColor Yellow

# 1. [Content_Types].xml - OPC Standard
$contentTypesPath = Join-Path $packageDir "[Content_Types].xml"
$contentTypes = @'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="xml" ContentType="application/xml" />
  <Override PartName="/AppManifest.xml" ContentType="application/xml" />
</Types>
'@
[System.IO.File]::WriteAllText($contentTypesPath, $contentTypes, [System.Text.Encoding]::UTF8)

# 2. Package .rels - Korrekte SharePoint Relationship
$relsPath = Join-Path "$packageDir\_rels" ".rels"
$rels = @'
<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="AppManifest.xml" />
</Relationships>
'@
[System.IO.File]::WriteAllText($relsPath, $rels, [System.Text.Encoding]::UTF8)

# 3. AppManifest.xml - Vollständiges Manifest
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

Write-Host "`n[2] Erstelle .sppkg mit optimaler Methode..." -ForegroundColor Yellow
$finalPackage = "sharepoint\solution\praevantion-time-planner-7zip.sppkg"

if ($sevenZipExe) {
    Write-Host "Verwende 7-Zip für OPC-kompatible Erstellung..." -ForegroundColor Green
    
    # Wechsle in Package-Verzeichnis für relative Pfade
    Push-Location $packageDir
    
    # 7-Zip Command mit optimalen Einstellungen für SharePoint
    $sevenZipArgs = @(
        "a",                    # Add files
        "-tzip",               # ZIP format
        "-mx=1",               # Fastest compression (SharePoint bevorzugt wenig Kompression)
        "-r",                  # Recursive
        "..\$finalPackage",    # Output file
        "*"                    # All files
    )
    
    $process = Start-Process -FilePath $sevenZipExe -ArgumentList $sevenZipArgs -Wait -PassThru -NoNewWindow
    Pop-Location
    
    if ($process.ExitCode -eq 0) {
        Write-Host "7-Zip Package erfolgreich erstellt!" -ForegroundColor Green
    } else {
        Write-Host "7-Zip Fehler (Exit Code: $($process.ExitCode))" -ForegroundColor Red
    }
    
} elseif ($useUpdatedPowerShell) {
    Write-Host "Verwende aktualisiertes PowerShell Archive Modul..." -ForegroundColor Green
    Compress-Archive -Path "$packageDir\*" -DestinationPath $finalPackage -Force
    
} else {
    Write-Host "Verwende Standard .NET Methode..." -ForegroundColor Yellow
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($packageDir, $finalPackage)
}

# Cleanup
Remove-Item $packageDir -Recurse -Force

Write-Host "`n[3] Verifikation..." -ForegroundColor Yellow
if (Test-Path $finalPackage) {
    $fileSize = (Get-Item $finalPackage).Length
    Write-Host "7-ZIP PACKAGE ERSTELLT: $fileSize Bytes" -ForegroundColor Green
    
    # Test das Package
    $testDir = "test_7zip"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    # Extrahiere mit Standard-Methode für Verifikation
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($finalPackage, $testDir)
    
    # Überprüfe Struktur
    $contentTypesFiles = Get-ChildItem $testDir | Where-Object { $_.Name -like "*Content_Types*" }
    $hasContentTypes = $contentTypesFiles.Count -gt 0
    $hasAppManifest = Test-Path "$testDir\AppManifest.xml"
    $hasRels = Test-Path "$testDir\_rels\.rels"
    
    Write-Host "`nSTRUKTUR-VERIFIKATION:" -ForegroundColor Cyan
    Write-Host "  [Content_Types].xml: $hasContentTypes" -ForegroundColor $(if($hasContentTypes){"Green"}else{"Red"})
    Write-Host "  AppManifest.xml: $hasAppManifest" -ForegroundColor $(if($hasAppManifest){"Green"}else{"Red"})
    Write-Host "  _rels\.rels: $hasRels" -ForegroundColor $(if($hasRels){"Green"}else{"Red"})
    
    # Teste Relationships
    if ($hasRels) {
        $relsContent = Get-Content "$testDir\_rels\.rels" -Raw
        $hasPackageManifest = $relsContent -match "package-manifest"
        $hasCorrectTarget = $relsContent -match "AppManifest\.xml"
        
        Write-Host "`nRELATIONSHIP-VERIFIKATION:" -ForegroundColor Cyan
        Write-Host "  package-manifest Type: $hasPackageManifest" -ForegroundColor $(if($hasPackageManifest){"Green"}else{"Red"})
        Write-Host "  Korrektes Target: $hasCorrectTarget" -ForegroundColor $(if($hasCorrectTarget){"Green"}else{"Red"})
        
        # Zeige .rels Inhalt
        Write-Host "`n.RELS INHALT:" -ForegroundColor Yellow
        Write-Host $relsContent -ForegroundColor Gray
        
        if ($hasPackageManifest -and $hasCorrectTarget) {
            Write-Host "`n🎉 7-ZIP PACKAGE IST OPC-KOMPATIBEL!" -ForegroundColor Green
            Write-Host "=======================================" -ForegroundColor Green
            Write-Host "Relationship-Fehler sollte behoben sein!" -ForegroundColor Green
            Write-Host "Package: $finalPackage" -ForegroundColor Cyan
            Write-Host "Größe: $fileSize Bytes" -ForegroundColor Cyan
            Write-Host "Methode: $(if($sevenZipExe){'7-Zip'}elseif($useUpdatedPowerShell){'Updated PowerShell'}else{'.NET Standard'})" -ForegroundColor Cyan
            Write-Host "=======================================" -ForegroundColor Green
        } else {
            Write-Host "`n❌ Relationship-Problem noch vorhanden!" -ForegroundColor Red
        }
    }
    
    Remove-Item $testDir -Recurse -Force
    
} else {
    Write-Host "FEHLER: Package wurde nicht erstellt!" -ForegroundColor Red
}

if (-not $sevenZipExe -and -not $useUpdatedPowerShell) {
    Write-Host "`n💡 EMPFEHLUNG:" -ForegroundColor Yellow
    Write-Host "Installieren Sie 7-Zip oder aktualisieren Sie PowerShell Archive für beste Kompatibilität:" -ForegroundColor Yellow
    Write-Host "- 7-Zip: https://www.7-zip.org/" -ForegroundColor Gray
    Write-Host "- PowerShell: Install-Module Microsoft.PowerShell.Archive -MinimumVersion 1.2.3.0" -ForegroundColor Gray
}
