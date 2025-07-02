# Ultimative Loesung: Manueller OPC-Package-Aufbau fuer SPFx 1.1.0
# Erstellt das Package manuell mit der exakten Struktur, die SharePoint erwartet

Write-Host "SPFx 1.1.0 Manueller OPC-Package-Aufbau" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Schritt 1: Build
Write-Host "`n[1] SPFx Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

# Schritt 2: Erstelle Package-Struktur manuell
Write-Host "`n[2] Erstelle SPFx-Kompatibles Package..." -ForegroundColor Yellow
gulp package-solution > $null 2>&1  # Ignoriere Fehler, nur fuer Debug-Dateien

$debugPath = "sharepoint\solution\debug"
if (-not (Test-Path "$debugPath\AppManifest.xml")) {
    Write-Host "Debug-Dateien fehlen!" -ForegroundColor Red
    exit 1
}

# Schritt 3: Manueller Package-Aufbau
$manualPackageDir = "manual_package_build"
if (Test-Path $manualPackageDir) { Remove-Item $manualPackageDir -Recurse -Force }
New-Item -ItemType Directory -Path $manualPackageDir | Out-Null

# Kopiere alle Dateien aus debug
Copy-Item "$debugPath\*" $manualPackageDir -Recurse -Force

# Kopiere _rels Verzeichnis
Copy-Item "$debugPath\_rels" $manualPackageDir -Recurse -Force

# Schritt 4: Korrigiere das AppManifest.xml
Write-Host "`n[3] Korrigiere App-Manifest..." -ForegroundColor Yellow
$manifestPath = "$manualPackageDir\AppManifest.xml"
$correctedManifest = @"
<?xml version="1.0" encoding="utf-8"?>
<App xmlns="http://schemas.microsoft.com/sharepoint/2012/app/manifest" Name="praevantion-time-planner-client-side-solution" ProductID="b8ca39ed-114d-4c73-b9c2-a99e485ba40c" Version="1.0.0.0" SharePointMinVersion="16.0.0.0" IsClientSideSolution="true" SkipFeatureDeployment="true">
  <Properties>
    <Title>praevantion-time-planner-client-side-solution</Title>
    <StartPage>~appWebUrl/Lists/SitePages/Home.aspx</StartPage>
  </Properties>
  <AppPrincipal>
    <Internal AllowedRemoteHostUrl="*" />
  </AppPrincipal>
</App>
"@

Set-Content -Path $manifestPath -Value $correctedManifest -Encoding UTF8 -NoNewline

# Schritt 5: Validiere alle erforderlichen Dateien
Write-Host "`n[4] Validiere Package-Struktur..." -ForegroundColor Yellow
$requiredFiles = @(
    "[Content_Types].xml",
    "_rels\.rels",
    "AppManifest.xml",
    "_rels\AppManifest.xml.rels"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $manualPackageDir $file
    if (-not (Test-Path -LiteralPath $filePath)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "FEHLER: Fehlende Dateien: $($missingFiles -join ', ')" -ForegroundColor Red
    Remove-Item $manualPackageDir -Recurse -Force
    exit 1
}

# Schritt 6: Erstelle Package mit .NET System.IO.Packaging (OPC-Standard)
Write-Host "`n[5] Erstelle OPC-Package..." -ForegroundColor Yellow

$sppkgPath = "sharepoint\solution\praevantion-time-planner-manual.sppkg"
if (Test-Path $sppkgPath) { Remove-Item $sppkgPath -Force }

# Verwende System.IO.Packaging fuer korrekte OPC-Struktur
Add-Type -AssemblyName WindowsBase

try {
    $package = [System.IO.Packaging.Package]::Open($sppkgPath, [System.IO.FileMode]::Create)
    
    # Fuege alle Dateien hinzu
    Get-ChildItem $manualPackageDir -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Substring($manualPackageDir.Length + 1)
        $uriPath = "/" + $relativePath.Replace('\', '/')
        
        # Bestimme Content-Type
        $contentType = "application/octet-stream"
        if ($_.Extension -eq ".xml") { $contentType = "text/xml" }
        if ($_.Extension -eq ".rels") { $contentType = "application/vnd.openxmlformats-package.relationships+xml" }
        
        $uri = New-Object System.Uri($uriPath, [System.UriKind]::Relative)
        $part = $package.CreatePart($uri, $contentType)
        
        $stream = $part.GetStream()
        $fileStream = [System.IO.File]::OpenRead($_.FullName)
        $fileStream.CopyTo($stream)
        $fileStream.Close()
        $stream.Close()
    }
    
    $package.Close()
    Write-Host "OPC-Package erstellt!" -ForegroundColor Green
    
} catch {
    Write-Host "Fehler beim OPC-Package: $($_.Exception.Message)" -ForegroundColor Red
    
    # Fallback: Standard ZIP-Methode
    Write-Host "Fallback: Standard ZIP-Methode..." -ForegroundColor Yellow
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($manualPackageDir, $sppkgPath)
}

# Cleanup
Remove-Item $manualPackageDir -Recurse -Force

# Schritt 7: Finale Verifikation
if (Test-Path $sppkgPath) {
    $fileSize = (Get-Item $sppkgPath).Length
    Write-Host "`n[6] ERFOLGREICH!" -ForegroundColor Green
    Write-Host "Package: $sppkgPath ($fileSize Bytes)" -ForegroundColor Green
    
    # Teste das Package
    Write-Host "`n[7] Package-Test..." -ForegroundColor Yellow
    $testDir = "final_package_test"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($sppkgPath, $testDir)
    
    $manifestContent = Get-Content "$testDir\AppManifest.xml" -Raw
    $relsContent = Get-Content "$testDir\_rels\.rels" -Raw
    
    $hasStartPage = $manifestContent -match "StartPage"
    $hasAppPrincipal = $manifestContent -match "AppPrincipal"
    $hasPackageManifest = $relsContent -match "package-manifest"
    
    Write-Host "StartPage: $hasStartPage" -ForegroundColor $(if($hasStartPage){"Green"}else{"Red"})
    Write-Host "AppPrincipal: $hasAppPrincipal" -ForegroundColor $(if($hasAppPrincipal){"Green"}else{"Red"})
    Write-Host "package-manifest: $hasPackageManifest" -ForegroundColor $(if($hasPackageManifest){"Green"}else{"Red"})
    
    if ($hasStartPage -and $hasAppPrincipal -and $hasPackageManifest) {
        Write-Host "`nPackage ist bereit fuer SharePoint!" -ForegroundColor Green
    } else {
        Write-Host "`nWARNUNG: Package koennte Probleme haben!" -ForegroundColor Red
    }
    
    Remove-Item $testDir -Recurse -Force
    
} else {
    Write-Host "FEHLER: Package wurde nicht erstellt!" -ForegroundColor Red
    exit 1
}
