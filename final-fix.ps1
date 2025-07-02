# Letzter Korrektur-Schritt für das SPFx Package
Write-Host "Finale Package-Korrektur" -ForegroundColor Green

$finalPackage = "sharepoint\solution\praevantion-time-planner-corrected.sppkg"
$correctedPackage = "sharepoint\solution\praevantion-time-planner-ready.sppkg"

if (Test-Path $correctedPackage) { Remove-Item $correctedPackage -Force }

# Extrahiere das aktuelle Package
$tempDir = "temp_final_fix"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($finalPackage, $tempDir)

# Erstelle [Content_Types].xml
$contentTypes = @'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="text/xml" />
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
</Types>
'@

$contentTypes | Out-File "$tempDir\[Content_Types].xml" -Encoding UTF8 -NoNewline

# Erstelle das finale Package
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $correctedPackage)

# Cleanup
Remove-Item $tempDir -Recurse -Force

# Finale Verifikation
if (Test-Path $correctedPackage) {
    $fileSize = (Get-Item $correctedPackage).Length
    Write-Host "`nFINALES PACKAGE ERSTELLT!" -ForegroundColor Green
    Write-Host "Pfad: $correctedPackage" -ForegroundColor Green
    Write-Host "Groesse: $fileSize Bytes" -ForegroundColor Green
    
    # Test
    $testDir = "final_verification"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    [System.IO.Compression.ZipFile]::ExtractToDirectory($correctedPackage, $testDir)
    
    $hasContentTypes = Test-Path "$testDir\[Content_Types].xml"
    $hasAppManifest = Test-Path "$testDir\AppManifest.xml"
    $hasPackageRels = Test-Path "$testDir\_rels\.rels"
    
    Write-Host "`nFINALE VERIFIKATION:" -ForegroundColor Cyan
    Write-Host "  [Content_Types].xml: $hasContentTypes" -ForegroundColor $(if($hasContentTypes){"Green"}else{"Red"})
    Write-Host "  AppManifest.xml: $hasAppManifest" -ForegroundColor $(if($hasAppManifest){"Green"}else{"Red"})
    Write-Host "  Package .rels: $hasPackageRels" -ForegroundColor $(if($hasPackageRels){"Green"}else{"Red"})
    
    if ($hasContentTypes -and $hasAppManifest -and $hasPackageRels) {
        Write-Host "`n🎉 PACKAGE IST VOLLSTAENDIG UND BEREIT!" -ForegroundColor Green
        Write-Host "Kann jetzt in SharePoint App-Katalog hochgeladen werden!" -ForegroundColor Green
    }
    
    Remove-Item $testDir -Recurse -Force
}
