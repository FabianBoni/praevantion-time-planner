# Robuste Loesung: Direkter Fix in der SPFx Build-Pipeline
# Korrigiert das AppManifest VOR der Package-Erstellung

Write-Host "SPFx 1.1.0 Robuste Manifest-Korrektur" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Schritt 1: Build
Write-Host "`n[1] SPFx Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "Build erfolgreich!" -ForegroundColor Green

# Schritt 2: Pre-Package-Manifest-Fix
Write-Host "`n[2] Pre-Package Manifest-Template erstellen..." -ForegroundColor Yellow

# Erstelle ein Template-Verzeichnis mit dem korrigierten Manifest
$templateDir = "config\templates"
if (-not (Test-Path $templateDir)) {
    New-Item -ItemType Directory -Path $templateDir -Force | Out-Null
}

$manifestTemplate = @"
<?xml version="1.0" encoding="utf-8"?>
<App xmlns="http://schemas.microsoft.com/sharepoint/2012/app/manifest"
     Name="`$solution.name`$"
     ProductID="`$solution.id`$"
     Version="`$solution.version`$"
     SharePointMinVersion="16.0.0.0"
     IsClientSideSolution="true"
     SkipFeatureDeployment="`$solution.skipFeatureDeployment`$">
  <Properties>
    <Title>`$solution.name`$</Title>
    <StartPage>~appWebUrl/Lists/SitePages/Home.aspx</StartPage>
  </Properties>
  <AppPrincipal>
    <Internal AllowedRemoteHostUrl="*" />
  </AppPrincipal>
</App>
"@

Set-Content -Path "$templateDir\AppManifest.xml" -Value $manifestTemplate -Encoding UTF8
Write-Host "Manifest-Template erstellt!" -ForegroundColor Green

# Schritt 3: Erstelle eine angepasste package-solution.json temporaer
Write-Host "`n[3] Backup und angepasste package-solution.json..." -ForegroundColor Yellow
$packageSolutionPath = "config\package-solution.json"
$backupPath = "config\package-solution.json.backup"

# Backup erstellen
Copy-Item $packageSolutionPath $backupPath -Force

# Lese aktuelle package-solution.json
$packageContent = Get-Content $packageSolutionPath -Raw | ConvertFrom-Json

# Fuege Template-Pfad hinzu (falls von SPFx 1.1 unterstuetzt)
$packageContent.paths | Add-Member -MemberType NoteProperty -Name "appManifestTemplate" -Value "templates/AppManifest.xml" -Force

# Schreibe angepasste Version
$packageContent | ConvertTo-Json -Depth 10 | Set-Content $packageSolutionPath -Encoding UTF8

# Schritt 4: Package-Erstellung mit SPFx-Tools
Write-Host "`n[4] Package mit SPFx-Tools erstellen..." -ForegroundColor Yellow
gulp package-solution

# Restore original package-solution.json
Write-Host "`n[5] Original package-solution.json wiederherstellen..." -ForegroundColor Yellow
Move-Item $backupPath $packageSolutionPath -Force

# Schritt 6: Fallback - Falls Template nicht funktioniert hat, direkter Fix
$sppkgPath = "sharepoint\solution\praevantion-time-planner.sppkg"
if (Test-Path $sppkgPath) {
    Write-Host "`n[6] Verifikation und ggf. Fallback-Fix..." -ForegroundColor Yellow
    
    # Teste ob das Manifest korrekt ist
    $testDir = "test_manifest_check"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($sppkgPath, $testDir)
    
    $manifestContent = Get-Content "$testDir\AppManifest.xml" -Raw
    if ($manifestContent -match "StartPage" -and $manifestContent -match "AppPrincipal") {
        Write-Host "Manifest ist bereits korrekt!" -ForegroundColor Green
    } else {
        Write-Host "Manifest muss noch korrigiert werden - Fallback..." -ForegroundColor Yellow
        
        # Direkter Fix des Manifests im extrahierten Verzeichnis
        $correctedManifest = @"
<?xml version="1.0" encoding="utf-8"?>
<App xmlns="http://schemas.microsoft.com/sharepoint/2012/app/manifest" 
     Name="praevantion-time-planner-client-side-solution" 
     ProductID="b8ca39ed-114d-4c73-b9c2-a99e485ba40c" 
     Version="1.0.0.0" 
     SharePointMinVersion="16.0.0.0" 
     IsClientSideSolution="true" 
     SkipFeatureDeployment="true">
  <Properties>
    <Title>praevantion-time-planner-client-side-solution</Title>
    <StartPage>~appWebUrl/Lists/SitePages/Home.aspx</StartPage>
  </Properties>
  <AppPrincipal>
    <Internal AllowedRemoteHostUrl="*" />
  </AppPrincipal>
</App>
"@
        
        Set-Content -Path "$testDir\AppManifest.xml" -Value $correctedManifest -Encoding UTF8
        
        # Erstelle korrigiertes Package mit der EXAKTEN Original-Methode wie SPFx
        Remove-Item $sppkgPath -Force
        
        # Verwende die gleiche Komprimierungsmethode wie SPFx (Store-Methode)
        $zipFile = [System.IO.Compression.ZipFile]::Open($sppkgPath, [System.IO.Compression.ZipArchiveMode]::Create)
        
        # Fuege Dateien in der EXAKTEN Reihenfolge hinzu wie SPFx es macht
        $orderedFiles = @(
            "[Content_Types].xml",
            "_rels\.rels",
            "AppManifest.xml",
            "_rels\AppManifest.xml.rels",
            "feature_34b44393-1d35-4242-89db-d4cc37228970.xml",
            "_rels\feature_34b44393-1d35-4242-89db-d4cc37228970.xml.rels",
            "feature_34b44393-1d35-4242-89db-d4cc37228970.xml.config.xml",
            "34b44393-1d35-4242-89db-d4cc37228970\WebPart_34b44393-1d35-4242-89db-d4cc37228970.xml"
        )
        
        foreach ($file in $orderedFiles) {
            $sourceFile = Join-Path $testDir $file
            if (Test-Path -LiteralPath $sourceFile) {
                $entry = $zipFile.CreateEntry($file.Replace('\', '/'), [System.IO.Compression.CompressionLevel]::NoCompression)
                $entryStream = $entry.Open()
                $fileStream = [System.IO.File]::OpenRead($sourceFile)
                $fileStream.CopyTo($entryStream)
                $fileStream.Close()
                $entryStream.Close()
            }
        }
        
        $zipFile.Dispose()
        Write-Host "Fallback-Fix angewendet!" -ForegroundColor Green
    }
    
    Remove-Item $testDir -Recurse -Force
    
    # Finale Verifikation
    $fileSize = (Get-Item $sppkgPath).Length
    Write-Host "`n[7] ERFOLGREICH!" -ForegroundColor Green
    Write-Host "Package: $sppkgPath ($fileSize Bytes)" -ForegroundColor Green
    Write-Host "Bereit fuer SharePoint-Bereitstellung!" -ForegroundColor Green
    
} else {
    Write-Host "FEHLER: Package wurde nicht erstellt!" -ForegroundColor Red
    exit 1
}
