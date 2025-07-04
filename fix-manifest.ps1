# fix-manifest.ps1
# This script replaces the generated AppManifest.xml and WebPart XML with our custom templates

# Parameters
$manifestSourcePath = ".\sharepoint\solution\AppManifest.template.xml"
$manifestTargetPath = ".\sharepoint\solution\debug\AppManifest.xml"

# Check if manifest template exists
if (Test-Path $manifestSourcePath) {
    # Copy the template to the debug folder, overwriting the existing file
    Copy-Item -Path $manifestSourcePath -Destination $manifestTargetPath -Force
    Write-Host "AppManifest.xml has been replaced with the custom template."
} else {
    Write-Host "Error: Manifest template file not found at $manifestSourcePath"
    exit 1
}

# Find the feature folder (which contains the GUID)
$featureFolder = Get-ChildItem -Path ".\sharepoint\solution\debug" -Directory | Where-Object { $_.Name -match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' } | Select-Object -First 1

if ($featureFolder) {
    $webPartSourcePath = ".\sharepoint\solution\WebPart_template.xml"
    $webPartTargetPath = ".\sharepoint\solution\debug\$($featureFolder.Name)\WebPart_$($featureFolder.Name).xml"
    
    # Check if WebPart template exists
    if (Test-Path $webPartSourcePath) {
        # Copy the template to the debug folder, overwriting the existing file
        Copy-Item -Path $webPartSourcePath -Destination $webPartTargetPath -Force
        Write-Host "WebPart XML has been replaced with the custom template."
    } else {
        Write-Host "Error: WebPart template file not found at $webPartSourcePath"
        exit 1
    }

    # Create ClientWebPart directory within the feature folder
    $clientWebPartPath = ".\sharepoint\solution\debug\$($featureFolder.Name)\ClientWebPart"
    if (-not (Test-Path $clientWebPartPath)) {
        New-Item -Path $clientWebPartPath -ItemType Directory -Force | Out-Null
        Write-Host "Created ClientWebPart directory in feature folder."
    }

    # Copy the ASPX file to the correct location within the feature folder
    $aspxSourcePath = ".\sharepoint\solution\ClientWebPart\TimePlannerWebPart.aspx"
    $aspxTargetPath = "$clientWebPartPath\TimePlannerWebPart.aspx"

    if (Test-Path $aspxSourcePath) {
        Copy-Item -Path $aspxSourcePath -Destination $aspxTargetPath -Force
        Write-Host "TimePlannerWebPart.aspx has been copied to feature folder."
    } else {
        Write-Host "Error: ASPX file not found at $aspxSourcePath"
        exit 1
    }
} else {
    Write-Host "Error: Could not find feature folder in debug directory."
    exit 1
}

# Find the feature folder (which contains the GUID)
$featureFolder = Get-ChildItem -Path ".\sharepoint\solution\debug" -Directory | Where-Object { $_.Name -match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' } | Select-Object -First 1

if ($featureFolder) {
    $webPartSourcePath = ".\sharepoint\solution\WebPart_template.xml"
    $webPartTargetPath = ".\sharepoint\solution\debug\$($featureFolder.Name)\WebPart_$($featureFolder.Name).xml"
    
    # Check if WebPart template exists
    if (Test-Path $webPartSourcePath) {
        # Copy the template to the debug folder, overwriting the existing file
        Copy-Item -Path $webPartSourcePath -Destination $webPartTargetPath -Force
        Write-Host "WebPart XML has been replaced with the custom template."
    } else {
        Write-Host "Error: WebPart template file not found at $webPartSourcePath"
        exit 1
    }
} else {
    Write-Host "Error: Could not find feature folder in debug directory."
    exit 1
}

# Next, create the .sppkg file (similar to what gulp package-solution does)
$spfxPackagePath = ".\sharepoint\solution\praevantion-time-planner.sppkg"
$debugFolder = ".\sharepoint\solution\debug"

# Ensure the 7-zip command-line tool is available
$sevenZipPath = "C:\Program Files\7-Zip\7z.exe"
if (-not (Test-Path $sevenZipPath)) {
    Write-Host "Error: 7-Zip command-line tool not found at $sevenZipPath"
    Write-Host "Please install 7-Zip or update the path in this script."
    exit 1
}

# Create the package using 7-Zip
& "$sevenZipPath" a -tzip "$spfxPackagePath" "$debugFolder\*" -mx0

Write-Host "Package created at $spfxPackagePath"
