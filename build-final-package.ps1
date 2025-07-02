# Erweiterte Loesung: Direkter Fix des .sppkg Archivs
# Dieses Script manipuliert das .sppkg Archiv direkt nach der Erstellung

Write-Host "SPFx Package mit direkter App-Manifest Korrektur" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

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

# Schritt 3: .sppkg manipulieren
Write-Host "`n[3] .sppkg Archiv korrigieren..." -ForegroundColor Yellow

$sppkgPath = "sharepoint\solution\praevantion-time-planner.sppkg"
$tempDir = "temp_sppkg_extract"
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
    [System.IO.Compression.ZipFile]::ExtractToDirectory($sppkgPath, $tempDir)
    
    # Korrigiere AppManifest.xml
    $manifestInZip = Join-Path $tempDir "AppManifest.xml"
    Set-Content -Path $manifestInZip -Value $correctedManifest -Encoding UTF8
    
    # Erstelle neues .sppkg
    Remove-Item $sppkgPath -Force
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $sppkgPath)
    
    # Aufräumen
    Remove-Item $tempDir -Recurse -Force
    
    Write-Host "App-Manifest im .sppkg korrigiert!" -ForegroundColor Green
    
    # Verifikation
    $fileSize = (Get-Item $sppkgPath).Length
    Write-Host "`n[4] ERFOLGREICH!" -ForegroundColor Green
    Write-Host "Package: $sppkgPath ($fileSize Bytes)" -ForegroundColor Green
    Write-Host "Das Package enthaelt jetzt das korrekte App-Manifest mit StartPage und AppPrincipal." -ForegroundColor Green
    
} catch {
    Write-Host "Fehler beim Korrigieren des .sppkg: $($_.Exception.Message)" -ForegroundColor Red
    if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
    exit 1
}
