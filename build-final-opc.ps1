# Verbessertes OPC-Package-Skript für SPFx 1.1.0
Write-Host "SPFx 1.1.0 Finales OPC-Package" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Cleanup alte Packages
$oldPackages = @(
    "sharepoint\solution\praevantion-time-planner-manual.sppkg",
    "sharepoint\solution\praevantion-time-planner-final.sppkg"
)
foreach ($pkg in $oldPackages) {
    if (Test-Path $pkg) { 
        Remove-Item $pkg -Force 
        Write-Host "Entfernt: $pkg" -ForegroundColor Yellow
    }
}

# Build
Write-Host "`n[1] SPFx Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Build fehlgeschlagen!" -ForegroundColor Red
    exit 1 
}

# Package-Solution
Write-Host "`n[2] Package Solution..." -ForegroundColor Yellow
gulp package-solution
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Package Solution fehlgeschlagen!" -ForegroundColor Red
    exit 1 
}

# Warte kurz
Start-Sleep -Seconds 2

# Erstelle manuelles Package
Write-Host "`n[3] Erstelle manuelles Package..." -ForegroundColor Yellow

$sourceDir = "sharepoint\solution\debug"
$finalPackage = "sharepoint\solution\praevantion-time-planner-final.sppkg"

# Temp Verzeichnis
$tempDir = "temp_final_package"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Kopiere grundlegende Struktur
Copy-Item "$sourceDir\[Content_Types].xml" $tempDir -Force
Copy-Item "$sourceDir\AppManifest.xml" $tempDir -Force

# Erstelle _rels Verzeichnis
$relsDir = "$tempDir\_rels"
New-Item -ItemType Directory -Path $relsDir -Force | Out-Null

# Erstelle korrekte .rels Datei für Package-Root
$packageRelsContent = @'
<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="/AppManifest.xml" Id="R1" />
</Relationships>
'@
$packageRelsContent | Out-File "$relsDir\.rels" -Encoding UTF8 -NoNewline

# Kopiere AppManifest.xml.rels
Copy-Item "$sourceDir\_rels\AppManifest.xml.rels" $relsDir -Force

# Kopiere alle anderen Dateien
Get-ChildItem $sourceDir -Recurse -File | Where-Object { 
    $_.FullName -notmatch "\\?_rels\\?\.rels$" -and
    $_.FullName -notmatch "\\?\[Content_Types\]\.xml$" -and
    $_.FullName -notmatch "\\?AppManifest\.xml$" -and
    $_.FullName -notmatch "\\?AppManifest\.xml\.rels$"
} | ForEach-Object {
    $relativePath = $_.FullName.Substring((Resolve-Path $sourceDir).Path.Length + 1)
    $targetPath = Join-Path $tempDir $relativePath
    $targetDir = Split-Path $targetPath
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    Copy-Item $_.FullName $targetPath -Force
}

# Erstelle ZIP-Package
Write-Host "`n[4] Erstelle ZIP-Package..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $finalPackage)

# Cleanup
Remove-Item $tempDir -Recurse -Force

# Verifikation
if (Test-Path $finalPackage) {
    $fileSize = (Get-Item $finalPackage).Length
    Write-Host "`n[5] ERFOLGREICH!" -ForegroundColor Green
    Write-Host "Package: $finalPackage ($fileSize Bytes)" -ForegroundColor Green
    
    # Test Package-Struktur
    Write-Host "`n[6] Package-Test..." -ForegroundColor Yellow
    $testDir = "final_test"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    try {
        [System.IO.Compression.ZipFile]::ExtractToDirectory($finalPackage, $testDir)
        
        # Teste wichtige Dateien
        $hasContentTypes = Test-Path "$testDir\[Content_Types].xml"
        $hasAppManifest = Test-Path "$testDir\AppManifest.xml"
        $hasPackageRels = Test-Path "$testDir\_rels\.rels"
        $hasAppManifestRels = Test-Path "$testDir\_rels\AppManifest.xml.rels"
        
        Write-Host "Content Types: $hasContentTypes" -ForegroundColor $(if($hasContentTypes){"Green"}else{"Red"})
        Write-Host "App Manifest: $hasAppManifest" -ForegroundColor $(if($hasAppManifest){"Green"}else{"Red"})
        Write-Host "Package Rels: $hasPackageRels" -ForegroundColor $(if($hasPackageRels){"Green"}else{"Red"})
        Write-Host "AppManifest Rels: $hasAppManifestRels" -ForegroundColor $(if($hasAppManifestRels){"Green"}else{"Red"})
        
        if ($hasPackageRels) {
            $relsContent = Get-Content "$testDir\_rels\.rels" -Raw
            $hasPackageManifestRel = $relsContent -match "package-manifest"
            Write-Host "package-manifest relationship: $hasPackageManifestRel" -ForegroundColor $(if($hasPackageManifestRel){"Green"}else{"Red"})
        }
        
        if ($hasAppManifest) {
            $manifestContent = Get-Content "$testDir\AppManifest.xml" -Raw
            $hasStartPage = $manifestContent -match "StartPage"
            $hasAppPrincipal = $manifestContent -match "AppPrincipal"
            Write-Host "StartPage: $hasStartPage" -ForegroundColor $(if($hasStartPage){"Green"}else{"Red"})
            Write-Host "AppPrincipal: $hasAppPrincipal" -ForegroundColor $(if($hasAppPrincipal){"Green"}else{"Red"})
        }
        
        Write-Host "`nPackage-Inhalt:" -ForegroundColor Cyan
        Get-ChildItem $testDir -Recurse | ForEach-Object {
            if ($_.PSIsContainer) {
                Write-Host "  [DIR]  $($_.FullName.Substring($testDir.Length + 1))" -ForegroundColor Blue
            } else {
                Write-Host "  [FILE] $($_.FullName.Substring($testDir.Length + 1)) ($($_.Length) bytes)" -ForegroundColor Gray
            }
        }
        
    } catch {
        Write-Host "Fehler beim Testen: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        Remove-Item $testDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "`nFINAL PACKAGE BEREIT!" -ForegroundColor Green
    Write-Host "Pfad: $finalPackage" -ForegroundColor Green
    
} else {
    Write-Host "FEHLER: Package wurde nicht erstellt!" -ForegroundColor Red
    exit 1
}
