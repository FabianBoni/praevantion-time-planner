# PowerShell Script fuer vollstaendiges SPFx Package mit korrigiertem App-Manifest
# Ausfuehrung: .\build-and-package.ps1

Write-Host "SPFx Build und Package mit App-Manifest Fix" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Schritt 1: Build
Write-Host "`n[1] Fuehre SPFx Build aus..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build fehlgeschlagen!" -ForegroundColor Red
    exit 1
}
Write-Host "Build erfolgreich!" -ForegroundColor Green

# Schritt 2: Erste Package-Erstellung (um Struktur zu generieren)
Write-Host "`n[2] Erstelle initiales Package..." -ForegroundColor Yellow
gulp package-solution
if ($LASTEXITCODE -ne 0) {
    Write-Host "Package-Erstellung fehlgeschlagen!" -ForegroundColor Red
    exit 1
}
Write-Host "Initiales Package erstellt!" -ForegroundColor Green

# Schritt 3: App-Manifest korrigieren
Write-Host "`n[3] Korrigiere App-Manifest..." -ForegroundColor Yellow
$manifestPath = "sharepoint\solution\debug\AppManifest.xml"
if (Test-Path $manifestPath) {
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
    Set-Content -Path $manifestPath -Value $correctedManifest -Encoding UTF8
    Write-Host "App-Manifest korrigiert!" -ForegroundColor Green
} else {
    Write-Host "App-Manifest nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Schritt 4: Finales Package erstellen
Write-Host "`n[4] Erstelle finales Package..." -ForegroundColor Yellow

# Losche das alte .sppkg
$sppkgPath = "sharepoint\solution\praevantion-time-planner.sppkg"
if (Test-Path $sppkgPath) {
    Remove-Item $sppkgPath -Force
}

# Erstelle neues Package
gulp package-solution
if ($LASTEXITCODE -ne 0) {
    Write-Host "Finales Package fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

# Schritt 5: Verifikation
Write-Host "`n[5] Verifikation..." -ForegroundColor Yellow
if (Test-Path $sppkgPath) {
    $fileSize = (Get-Item $sppkgPath).Length
    Write-Host "Package erstellt: $sppkgPath ($fileSize Bytes)" -ForegroundColor Green
    
    # Zeige das korrigierte App-Manifest an
    Write-Host "`nApp-Manifest Inhalt:" -ForegroundColor Cyan
    Get-Content $manifestPath | Write-Host -ForegroundColor White
    
    Write-Host "`nERFOLGREICH! Das Package ist bereit fuer die Bereitstellung." -ForegroundColor Green
    Write-Host "Package-Pfad: $(Resolve-Path $sppkgPath)" -ForegroundColor Green
} else {
    Write-Host "Package wurde nicht erstellt!" -ForegroundColor Red
    exit 1
}
