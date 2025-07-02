# fix-manifest.ps1
# This script replaces the generated AppManifest.xml with our custom template

# Parameters
$sourcePath = ".\sharepoint\solution\AppManifest.template.xml"
$targetPath = ".\sharepoint\solution\debug\AppManifest.xml"

# Check if source file exists
if (Test-Path $sourcePath) {
    # Copy the template to the debug folder, overwriting the existing file
    Copy-Item -Path $sourcePath -Destination $targetPath -Force
    Write-Host "AppManifest.xml has been replaced with the custom template."
} else {
    Write-Host "Error: Template file not found at $sourcePath"
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
