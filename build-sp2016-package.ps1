# SPFx 1.1.0 SHAREPOINT 2016 KOMPATIBLES PACKAGE
# Basiert auf erfolgreichen SharePoint 2016 SPFx Deployments
Write-Host "SPFx 1.1.0 SHAREPOINT 2016 PACKAGE" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Cleanup
if (Test-Path "sharepoint\solution\praevantion-time-planner-sp2016.sppkg") {
    Remove-Item "sharepoint\solution\praevantion-time-planner-sp2016.sppkg" -Force
}

# Temp-Verzeichnis
$packageDir = "sp2016_package"
if (Test-Path $packageDir) { Remove-Item $packageDir -Recurse -Force }
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null
New-Item -ItemType Directory -Path "$packageDir\_rels" -Force | Out-Null

Write-Host "`n[1] Erstelle SharePoint 2016 kompatible Struktur..." -ForegroundColor Yellow

# 1. [Content_Types].xml - SharePoint 2016 Format
Write-Host "  Erstelle [Content_Types].xml..." -ForegroundColor Gray
$contentTypes = '<?xml version="1.0" encoding="utf-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" /><Default Extension="xml" ContentType="application/xml" /><Override PartName="/AppManifest.xml" ContentType="application/xml" /></Types>'

# Verwende .NET FileStream für exakte Kontrolle
$fs = [System.IO.FileStream]::new("$packageDir\[Content_Types].xml", [System.IO.FileMode]::Create)
$bytes = [System.Text.Encoding]::UTF8.GetBytes($contentTypes)
$fs.Write($bytes, 0, $bytes.Length)
$fs.Close()

# 2. Package .rels - SharePoint 2016 Format
Write-Host "  Erstelle Package .rels..." -ForegroundColor Gray
$packageRels = '<?xml version="1.0" encoding="utf-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="AppManifest.xml" /></Relationships>'

$fs = [System.IO.FileStream]::new("$packageDir\_rels\.rels", [System.IO.FileMode]::Create)
$bytes = [System.Text.Encoding]::UTF8.GetBytes($packageRels)
$fs.Write($bytes, 0, $bytes.Length)
$fs.Close()

# 3. AppManifest.xml - SharePoint 2016 Format
Write-Host "  Erstelle AppManifest.xml..." -ForegroundColor Gray
$appManifest = '<?xml version="1.0" encoding="utf-8"?><App xmlns="http://schemas.microsoft.com/sharepoint/2012/app/manifest" Name="praevantion-time-planner-client-side-solution" ProductID="b8ca39ed-114d-4c73-b9c2-a99e485ba40c" Version="1.0.0.0" SharePointMinVersion="16.0.0.0" IsClientSideSolution="true" SkipFeatureDeployment="true"><Properties><Title>Praevantion Time Planner</Title><StartPage>~appWebUrl/Lists/SitePages/Home.aspx</StartPage></Properties><AppPrincipal><Internal AllowedRemoteHostUrl="*" /></AppPrincipal></App>'

$fs = [System.IO.FileStream]::new("$packageDir\AppManifest.xml", [System.IO.FileMode]::Create)
$bytes = [System.Text.Encoding]::UTF8.GetBytes($appManifest)
$fs.Write($bytes, 0, $bytes.Length)
$fs.Close()

Write-Host "`n[2] Erstelle ZIP-Package..." -ForegroundColor Yellow
$finalPackage = "sharepoint\solution\praevantion-time-planner-sp2016.sppkg"

# Verwende System.IO.Packaging für OPC-kompatible Erstellung
Add-Type -AssemblyName WindowsBase
try {
    $package = [System.IO.Packaging.Package]::Open($finalPackage, [System.IO.FileMode]::Create)
    
    # Füge jede Datei einzeln hinzu
    $files = Get-ChildItem $packageDir -Recurse -File
    
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($packageDir.Length + 1)
        $uriPath = "/" + $relativePath.Replace('\', '/')
        
        # Bestimme Content-Type
        $contentType = "application/octet-stream"
        if ($file.Extension -eq ".xml") { 
            if ($file.Name -eq "[Content_Types].xml") {
                continue # Wird automatisch von Package erstellt
            }
            $contentType = "application/xml" 
        }
        if ($file.Extension -eq ".rels") { 
            $contentType = "application/vnd.openxmlformats-package.relationships+xml" 
        }
        
        Write-Host "  Hinzufuegen: $uriPath ($contentType)" -ForegroundColor Gray
        
        $uri = New-Object System.Uri($uriPath, [System.UriKind]::Relative)
        $part = $package.CreatePart($uri, $contentType)
        
        $stream = $part.GetStream()
        $fileStream = [System.IO.File]::OpenRead($file.FullName)
        $fileStream.CopyTo($stream)
        $fileStream.Close()
        $stream.Close()
    }
    
    $package.Close()
    Write-Host "OPC Package erfolgreich erstellt!" -ForegroundColor Green
    
} catch {
    Write-Host "OPC Fehler: $($_.Exception.Message)" -ForegroundColor Red
    
    # Fallback zu ZIP
    Write-Host "Fallback zu ZIP-Methode..." -ForegroundColor Yellow
    if (Test-Path $finalPackage) { Remove-Item $finalPackage -Force }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($packageDir, $finalPackage)
}

# Cleanup
Remove-Item $packageDir -Recurse -Force

Write-Host "`n[3] Finale Verifikation..." -ForegroundColor Yellow
if (Test-Path $finalPackage) {
    $fileSize = (Get-Item $finalPackage).Length
    Write-Host "SP2016 PACKAGE ERSTELLT: $fileSize Bytes" -ForegroundColor Green
    
    # Test das Package
    $testDir = "sp2016_test"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($finalPackage, $testDir)
    
    # Überprüfe alle Dateien
    Write-Host "`nPACKAGE INHALT:" -ForegroundColor Cyan
    Get-ChildItem $testDir -Recurse | ForEach-Object {
        if (-not $_.PSIsContainer) {
            Write-Host "  $($_.Name) ($($_.Length) bytes)" -ForegroundColor Gray
        }
    }
    
    # Teste Content_Types mit alternativen Methoden
    $contentTypesExists = (Get-ChildItem $testDir | Where-Object { $_.Name -like "*Content_Types*" }).Count -gt 0
    $appManifestExists = Test-Path "$testDir\AppManifest.xml"
    $relsExists = Test-Path "$testDir\_rels\.rels"
    
    Write-Host "`nSTRUKTUR-CHECK (Alternative):" -ForegroundColor Cyan
    Write-Host "  Content_Types vorhanden: $contentTypesExists" -ForegroundColor $(if($contentTypesExists){"Green"}else{"Red"})
    Write-Host "  AppManifest vorhanden: $appManifestExists" -ForegroundColor $(if($appManifestExists){"Green"}else{"Red"})
    Write-Host "  Package .rels vorhanden: $relsExists" -ForegroundColor $(if($relsExists){"Green"}else{"Red"})
    
    if ($relsExists) {
        $relsContent = Get-Content "$testDir\_rels\.rels" -Raw
        Write-Host "`n.RELS INHALT:" -ForegroundColor Yellow
        Write-Host $relsContent -ForegroundColor Gray
        
        $hasPackageManifest = $relsContent -match "package-manifest"
        $hasCorrectTarget = $relsContent -match "AppManifest\.xml"
        
        Write-Host "`nRELATIONSHIP VALIDIERUNG:" -ForegroundColor Cyan
        Write-Host "  package-manifest: $hasPackageManifest" -ForegroundColor $(if($hasPackageManifest){"Green"}else{"Red"})
        Write-Host "  AppManifest Target: $hasCorrectTarget" -ForegroundColor $(if($hasCorrectTarget){"Green"}else{"Red"})
        
        if ($hasPackageManifest -and $hasCorrectTarget) {
            Write-Host "`n🎉 SP2016 PACKAGE IST BEREIT!" -ForegroundColor Green
            Write-Host "Dieses Package sollte den Relationship-Fehler beheben!" -ForegroundColor Green
        }
    }
    
    Remove-Item $testDir -Recurse -Force
    
    Write-Host "`n===================================" -ForegroundColor Green
    Write-Host "SHAREPOINT 2016 PACKAGE FERTIG!" -ForegroundColor Green
    Write-Host "Package: sharepoint\solution\praevantion-time-planner-sp2016.sppkg" -ForegroundColor Cyan
    Write-Host "Größe: $fileSize Bytes" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Green
    
} else {
    Write-Host "FEHLER: Package wurde nicht erstellt!" -ForegroundColor Red
}
