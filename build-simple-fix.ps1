# Einfache und robuste Loesung fuer SPFx 1.1.0 App-Manifest Problem
# Verwendet das debug-Verzeichnis und korrigiert das Manifest direkt dort

Write-Host "SPFx App-Manifest Fix fuer SPFx 1.1.0" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Schritt 1: Build
Write-Host "`n[1] SPFx Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Build fehlgeschlagen!" -ForegroundColor Red
    exit 1 
}
Write-Host "Build erfolgreich!" -ForegroundColor Green

# Schritt 2: Package erstellen
Write-Host "`n[2] Initiales Package erstellen..." -ForegroundColor Yellow
gulp package-solution

# Pruefen ob Debug-Dateien erstellt wurden (auch bei gulp-Fehler)
$debugPath = "sharepoint\solution\debug"
if (Test-Path "$debugPath\AppManifest.xml") {
    Write-Host "Debug-Dateien vorhanden, fahre fort..." -ForegroundColor Green
} else {
    Write-Host "Debug-Dateien fehlen!" -ForegroundColor Red
    exit 1
}

# Schritt 3: App-Manifest im debug-Verzeichnis korrigieren
Write-Host "`n[3] App-Manifest korrigieren..." -ForegroundColor Yellow
$debugManifestPath = "sharepoint\solution\debug\AppManifest.xml"

if (Test-Path $debugManifestPath) {
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
    
    Set-Content -Path $debugManifestPath -Value $correctedManifest -Encoding UTF8
    Write-Host "Debug App-Manifest korrigiert!" -ForegroundColor Green
} else {
    Write-Host "Debug App-Manifest nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Schritt 4: Neues Package aus korrigiertem debug-Verzeichnis erstellen
Write-Host "`n[4] Finales Package mit korrigiertem Manifest erstellen..." -ForegroundColor Yellow

# Loesche das alte .sppkg
$sppkgPath = "sharepoint\solution\praevantion-time-planner.sppkg"
if (Test-Path $sppkgPath) {
    # Warte kurz und versuche mehrmals zu loeschen
    for ($i = 1; $i -le 3; $i++) {
        try {
            Remove-Item $sppkgPath -Force
            break
        } catch {
            Write-Host "Versuch $($i): Datei ist gesperrt, warte..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    }
    
    # Wenn immer noch vorhanden, verwende anderen Namen
    if (Test-Path $sppkgPath) {
        $sppkgPath = "sharepoint\solution\praevantion-time-planner-fixed.sppkg"
        Write-Host "Verwende neuen Dateinamen: $sppkgPath" -ForegroundColor Yellow
    }
}

try {
    # Verwende .NET Framework ZIP-Funktionen
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    
    # Erstelle ZIP aus debug-Verzeichnis
    $debugPath = "sharepoint\solution\debug"
    [System.IO.Compression.ZipFile]::CreateFromDirectory($debugPath, $sppkgPath)
    
    Write-Host "Finales Package erstellt!" -ForegroundColor Green
    
    # Verifikation
    if (Test-Path $sppkgPath) {
        $fileSize = (Get-Item $sppkgPath).Length
        Write-Host "`n[5] ERFOLGREICH!" -ForegroundColor Green
        Write-Host "Package: $sppkgPath ($fileSize Bytes)" -ForegroundColor Green
        
        # Teste das korrigierte Manifest im Package
        Write-Host "`n[6] Verifikation des App-Manifests..." -ForegroundColor Yellow
        $testDir = "test_final_package"
        if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
        New-Item -ItemType Directory -Path $testDir | Out-Null
        
        [System.IO.Compression.ZipFile]::ExtractToDirectory($sppkgPath, $testDir)
        
        if (Test-Path "$testDir\AppManifest.xml") {
            $manifestContent = Get-Content "$testDir\AppManifest.xml" -Raw
            if ($manifestContent -match "StartPage" -and $manifestContent -match "AppPrincipal") {
                Write-Host "StartPage und AppPrincipal im finalen Package vorhanden!" -ForegroundColor Green
            } else {
                Write-Host "WARNUNG: StartPage oder AppPrincipal fehlen!" -ForegroundColor Red
            }
            
            # Zeige das Manifest an
            Write-Host "`nFinales App-Manifest:" -ForegroundColor Cyan
            Get-Content "$testDir\AppManifest.xml" | Write-Host -ForegroundColor White
        }
        
        # Pruefe .rels
        if (Test-Path "$testDir\_rels\.rels") {
            $relsContent = Get-Content "$testDir\_rels\.rels" -Raw
            if ($relsContent -match "package-manifest") {
                Write-Host "`npackage-manifest Beziehung OK!" -ForegroundColor Green
            } else {
                Write-Host "`nWARNUNG: package-manifest Beziehung fehlt!" -ForegroundColor Red
            }
        }
        
        Remove-Item $testDir -Recurse -Force
        
        Write-Host "`nDas Package ist bereit fuer die SharePoint-Bereitstellung!" -ForegroundColor Green
        
    } else {
        Write-Host "Package wurde nicht erstellt!" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Fehler beim Erstellen des finalen Packages: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
