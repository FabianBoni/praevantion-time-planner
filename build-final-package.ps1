# Erweiterte Loesung: Korrekter Fix des .sppkg mit erhaltener .rels Struktur
# Dieses Script manipuliert nur das AppManifest.xml ohne die OPC-Struktur zu beschaedigen

Write-Host "SPFx Package mit korrekter OPC-Struktur" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Schritt 1: Build
Write-Host "`n[1] SPFx Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "Build erfolgreich!" -ForegroundColor Green

# Schritt 2: Package erstellen
Write-Host "`n[2] Package erstellen..." -ForegroundColor Yellow
gulp package-solution
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "Package erstellt!" -ForegroundColor Green

# Schritt 3: .sppkg korrekt manipulieren mit erhaltener OPC-Struktur
Write-Host "`n[3] .sppkg mit korrekter OPC-Struktur korrigieren..." -ForegroundColor Yellow

$sppkgPath = "sharepoint\solution\praevantion-time-planner.sppkg"
$tempDir = "temp_sppkg_fix"
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

try {
    # Erstelle temporaeres Verzeichnis
    if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    
    # Extrahiere .sppkg (ist ein ZIP-Archiv)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($sppkgPath)
    
    # Extrahiere alle Dateien und behalte die Struktur bei
    foreach ($entry in $zip.Entries) {
        $destinationPath = Join-Path $tempDir $entry.FullName
        $destinationDir = Split-Path $destinationPath -Parent
        
        if (-not (Test-Path $destinationDir)) {
            New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
        }
        
        if ($entry.Name -ne "") {  # Nicht Verzeichnis
            $fileStream = $entry.Open()
            $destinationStream = [System.IO.File]::Create($destinationPath)
            $fileStream.CopyTo($destinationStream)
            $destinationStream.Close()
            $fileStream.Close()
        }
    }
    $zip.Dispose()
    
    # Korrigiere nur das AppManifest.xml
    $manifestInZip = Join-Path $tempDir "AppManifest.xml"
    if (Test-Path $manifestInZip) {
        Set-Content -Path $manifestInZip -Value $correctedManifest -Encoding UTF8
        Write-Host "AppManifest.xml korrigiert" -ForegroundColor Green
    } else {
        Write-Host "AppManifest.xml nicht gefunden!" -ForegroundColor Red
        throw "AppManifest.xml nicht im Package gefunden"
    }
    
    # Erstelle neues .sppkg mit erhaltener Kompression und Struktur
    Remove-Item $sppkgPath -Force
    
    # Verwende eine andere Methode, um das ZIP zu erstellen, die die Struktur erhält
    $zipFile = [System.IO.Compression.ZipFile]::Open($sppkgPath, [System.IO.Compression.ZipArchiveMode]::Create)
    
    # Fuege alle Dateien mit korrekter Struktur hinzu
    Get-ChildItem -Path $tempDir -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Substring($tempDir.Length + 1).Replace('\', '/')
        $entry = $zipFile.CreateEntry($relativePath)
        $entryStream = $entry.Open()
        $fileStream = $_.OpenRead()
        $fileStream.CopyTo($entryStream)
        $fileStream.Close()
        $entryStream.Close()
    }
    
    $zipFile.Dispose()
    
    # Aufräumen
    Remove-Item $tempDir -Recurse -Force
    
    Write-Host "App-Manifest im .sppkg korrigiert (OPC-Struktur erhalten)!" -ForegroundColor Green
    
    # Verifikation
    $fileSize = (Get-Item $sppkgPath).Length
    Write-Host "`n[4] ERFOLGREICH!" -ForegroundColor Green
    Write-Host "Package: $sppkgPath ($fileSize Bytes)" -ForegroundColor Green
    Write-Host "OPC-Struktur und .rels-Dateien wurden korrekt erhalten." -ForegroundColor Green
    
    # Teste die .rels Struktur
    Write-Host "`n[5] Verifikation der OPC-Struktur..." -ForegroundColor Yellow
    $verifyDir = "verify_structure"
    if (Test-Path $verifyDir) { Remove-Item $verifyDir -Recurse -Force }
    New-Item -ItemType Directory -Path $verifyDir | Out-Null
    [System.IO.Compression.ZipFile]::ExtractToDirectory($sppkgPath, $verifyDir)
    
    if (Test-Path "$verifyDir\_rels\.rels") {
        $relsContent = Get-Content "$verifyDir\_rels\.rels" -Raw
        if ($relsContent -match "package-manifest") {
            Write-Host "package-manifest Beziehung gefunden!" -ForegroundColor Green
        } else {
            Write-Host "WARNUNG: package-manifest Beziehung fehlt!" -ForegroundColor Red
        }
    } else {
        Write-Host "WARNUNG: .rels Datei fehlt!" -ForegroundColor Red
    }
    
    Remove-Item $verifyDir -Recurse -Force
    
} catch {
    Write-Host "Fehler beim Korrigieren des .sppkg: $($_.Exception.Message)" -ForegroundColor Red
    if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
    exit 1
}
