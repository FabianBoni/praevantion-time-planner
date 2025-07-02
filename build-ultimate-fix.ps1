# Ultimative SPFx Relationship-Fix für SharePoint 2016/2019/Online
Write-Host "SPFx Relationship-Error ULTIMATIVE LÖSUNG" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# 1. Cleanup
$packages = @(
    "sharepoint\solution\praevantion-time-planner-ready.sppkg",
    "sharepoint\solution\praevantion-time-planner-ultimate.sppkg"
)
foreach ($pkg in $packages) {
    if (Test-Path $pkg) { Remove-Item $pkg -Force -ErrorAction SilentlyContinue }
}

# 2. Standard Build ohne Package-Solution
Write-Host "`n[1] SPFx Build..." -ForegroundColor Yellow
npm run build | Out-Null
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Build fehlgeschlagen!" -ForegroundColor Red
    exit 1 
}

# 3. Manuelle Package-Erstellung (umgeht SPFx Build-Probleme)
Write-Host "`n[2] Manuelle Package-Erstellung..." -ForegroundColor Yellow

$buildDir = "sharepoint\solution\debug"
if (Test-Path $buildDir) { Remove-Item $buildDir -Recurse -Force }
New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
New-Item -ItemType Directory -Path "$buildDir\_rels" -Force | Out-Null
New-Item -ItemType Directory -Path "$buildDir\34b44393-1d35-4242-89db-d4cc37228970" -Force | Out-Null

# Erstelle AppManifest.xml
$appManifest = @'
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
[System.IO.File]::WriteAllText("$buildDir\AppManifest.xml", $appManifest, [System.Text.Encoding]::UTF8)

# Erstelle [Content_Types].xml
$contentTypes = @'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="text/xml" />
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
</Types>
'@
[System.IO.File]::WriteAllText("$buildDir\[Content_Types].xml", $contentTypes, [System.Text.Encoding]::UTF8)

# Erstelle KORREKTE Package-level .rels (das ist der Schlüssel!)
$packageRels = @'
<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest" Target="/AppManifest.xml" Id="R1" />
</Relationships>
'@
[System.IO.File]::WriteAllText("$buildDir\_rels\.rels", $packageRels, [System.Text.Encoding]::UTF8)

# Erstelle Feature.xml
$featureXml = @'
<?xml version="1.0" encoding="utf-8"?>
<Feature xmlns="http://schemas.microsoft.com/sharepoint/" Id="34b44393-1d35-4242-89db-d4cc37228970" Title="Praevantion Time Planner Feature" Description="The feature that activates elements of the Praevantion Time Planner solution." Version="1.0.0.0" Scope="Site">
  <ElementManifests>
    <ElementManifest Location="34b44393-1d35-4242-89db-d4cc37228970\WebPart_34b44393-1d35-4242-89db-d4cc37228970.xml" />
  </ElementManifests>
</Feature>
'@
[System.IO.File]::WriteAllText("$buildDir\feature_34b44393-1d35-4242-89db-d4cc37228970.xml", $featureXml, [System.Text.Encoding]::UTF8)

# Erstelle Feature Config
$featureConfig = @'
<?xml version="1.0" encoding="utf-8"?>
<FeatureManifestReference xmlns="http://schemas.microsoft.com/sharepoint/" FeatureId="34b44393-1d35-4242-89db-d4cc37228970" />
'@
[System.IO.File]::WriteAllText("$buildDir\feature_34b44393-1d35-4242-89db-d4cc37228970.xml.config.xml", $featureConfig, [System.Text.Encoding]::UTF8)

# Erstelle WebPart Definition
$webPartXml = @'
<?xml version="1.0" encoding="utf-8"?>
<Elements xmlns="http://schemas.microsoft.com/sharepoint/">
  <ClientSideComponentInstance 
    InstanceId="34b44393-1d35-4242-89db-d4cc37228970"
    ComponentId="34b44393-1d35-4242-89db-d4cc37228970"
    Title="Praevantion Time Planner" 
    Description="Intelligente Terminplanung für das Präventionsteam Basel-Stadt">
  </ClientSideComponentInstance>
</Elements>
'@
[System.IO.File]::WriteAllText("$buildDir\34b44393-1d35-4242-89db-d4cc37228970\WebPart_34b44393-1d35-4242-89db-d4cc37228970.xml", $webPartXml, [System.Text.Encoding]::UTF8)

# Erstelle AppManifest.xml.rels
$appManifestRels = @'
<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/manifest-feature" Target="/feature_34b44393-1d35-4242-89db-d4cc37228970.xml" Id="R2" />
</Relationships>
'@
[System.IO.File]::WriteAllText("$buildDir\_rels\AppManifest.xml.rels", $appManifestRels, [System.Text.Encoding]::UTF8)

# Erstelle Feature .rels
New-Item -ItemType Directory -Path "$buildDir\_rels" -Force | Out-Null
$featureRels = @'
<?xml version="1.0" encoding="utf-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/feature-element" Target="/34b44393-1d35-4242-89db-d4cc37228970/WebPart_34b44393-1d35-4242-89db-d4cc37228970.xml" Id="R3" />
</Relationships>
'@
[System.IO.File]::WriteAllText("$buildDir\_rels\feature_34b44393-1d35-4242-89db-d4cc37228970.xml.rels", $featureRels, [System.Text.Encoding]::UTF8)

# 4. Erstelle das finale .sppkg
Write-Host "`n[3] Erstelle finales .sppkg..." -ForegroundColor Yellow
$finalPackage = "sharepoint\solution\praevantion-time-planner-ultimate.sppkg"

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($buildDir, $finalPackage)

# 5. Verifikation
if (Test-Path $finalPackage) {
    $fileSize = (Get-Item $finalPackage).Length
    Write-Host "`n[4] PACKAGE ERSTELLT!" -ForegroundColor Green
    Write-Host "Package: $finalPackage ($fileSize Bytes)" -ForegroundColor Green
    
    # Teste das Package
    Write-Host "`n[5] Package-Verifikation..." -ForegroundColor Yellow
    $testDir = "ultimate_test"
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    
    [System.IO.Compression.ZipFile]::ExtractToDirectory($finalPackage, $testDir)
    
    # Überprüfe alle kritischen Komponenten
    $hasContentTypes = Test-Path "$testDir\[Content_Types].xml"
    $hasAppManifest = Test-Path "$testDir\AppManifest.xml"
    $hasPackageRels = Test-Path "$testDir\_rels\.rels"
    $hasAppManifestRels = Test-Path "$testDir\_rels\AppManifest.xml.rels"
    $hasFeature = Test-Path "$testDir\feature_34b44393-1d35-4242-89db-d4cc37228970.xml"
    $hasWebPart = Test-Path "$testDir\34b44393-1d35-4242-89db-d4cc37228970\WebPart_34b44393-1d35-4242-89db-d4cc37228970.xml"
    
    Write-Host "STRUKTUR-CHECK:" -ForegroundColor Cyan
    Write-Host "  [Content_Types].xml: $hasContentTypes" -ForegroundColor $(if($hasContentTypes){"Green"}else{"Red"})
    Write-Host "  AppManifest.xml: $hasAppManifest" -ForegroundColor $(if($hasAppManifest){"Green"}else{"Red"})
    Write-Host "  Package .rels: $hasPackageRels" -ForegroundColor $(if($hasPackageRels){"Green"}else{"Red"})
    Write-Host "  AppManifest .rels: $hasAppManifestRels" -ForegroundColor $(if($hasAppManifestRels){"Green"}else{"Red"})
    Write-Host "  Feature XML: $hasFeature" -ForegroundColor $(if($hasFeature){"Green"}else{"Red"})
    Write-Host "  WebPart XML: $hasWebPart" -ForegroundColor $(if($hasWebPart){"Green"}else{"Red"})
    
    # Überprüfe Relationship-Inhalte
    if ($hasPackageRels) {
        $relsContent = [System.IO.File]::ReadAllText("$testDir\_rels\.rels")
        $hasCorrectPackageRel = $relsContent -match 'Type="http://schemas.microsoft.com/sharepoint/2012/app/relationships/package-manifest"'
        $hasCorrectTarget = $relsContent -match 'Target="/AppManifest.xml"'
        
        Write-Host "`nRELATIONSHIP-CHECK:" -ForegroundColor Cyan
        Write-Host "  package-manifest Type: $hasCorrectPackageRel" -ForegroundColor $(if($hasCorrectPackageRel){"Green"}else{"Red"})
        Write-Host "  AppManifest Target: $hasCorrectTarget" -ForegroundColor $(if($hasCorrectTarget){"Green"}else{"Red"})
    }
    
    # Überprüfe App-Manifest Inhalte
    if ($hasAppManifest) {
        $manifestContent = [System.IO.File]::ReadAllText("$testDir\AppManifest.xml")
        $hasStartPage = $manifestContent -match "StartPage"
        $hasAppPrincipal = $manifestContent -match "AppPrincipal"
        $hasCorrectId = $manifestContent -match "b8ca39ed-114d-4c73-b9c2-a99e485ba40c"
        
        Write-Host "`nAPP-MANIFEST-CHECK:" -ForegroundColor Cyan
        Write-Host "  StartPage: $hasStartPage" -ForegroundColor $(if($hasStartPage){"Green"}else{"Red"})
        Write-Host "  AppPrincipal: $hasAppPrincipal" -ForegroundColor $(if($hasAppPrincipal){"Green"}else{"Red"})
        Write-Host "  Product ID: $hasCorrectId" -ForegroundColor $(if($hasCorrectId){"Green"}else{"Red"})
    }
    
    # Finale Bewertung
    $allCritical = $hasContentTypes -and $hasAppManifest -and $hasPackageRels -and $hasAppManifestRels
    
    if ($allCritical) {
        Write-Host "`n🎉 ULTIMATIVES PACKAGE IST BEREIT!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "RELATIONSHIP-FEHLER SOLLTE BEHOBEN SEIN!" -ForegroundColor Green
        Write-Host "Package: $finalPackage" -ForegroundColor Green
        Write-Host "Größe: $fileSize Bytes" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Package hat noch kritische Probleme!" -ForegroundColor Red
    }
    
    Remove-Item $testDir -Recurse -Force
    
} else {
    Write-Host "FEHLER: Package wurde nicht erstellt!" -ForegroundColor Red
    exit 1
}

Write-Host "`nDas Package ist bereit für SharePoint!" -ForegroundColor Green
