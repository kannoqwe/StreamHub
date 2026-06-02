param(
    [Parameter(Mandatory = $true)]
    [string]$CompartmentId,

    [Parameter(Mandatory = $true)]
    [string]$SubnetId,

    [Parameter(Mandatory = $true)]
    [string]$ImageId,

    [Parameter(Mandatory = $true)]
    [string]$SshPublicKeyFile,

    [string]$DisplayName = "streamhub-a1",

    [string[]]$AvailabilityDomains = @(
        "eURg:EU-FRANKFURT-1-AD-1",
        "eURg:EU-FRANKFURT-1-AD-2",
        "eURg:EU-FRANKFURT-1-AD-3"
    ),

    [int]$BootVolumeSizeInGbs = 100,
    [int]$SleepSeconds = 300,
    [int]$MaxAttempts = 0
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command oci -ErrorAction SilentlyContinue)) {
    throw "OCI CLI is not installed or is not available in PATH. Install it and run 'oci setup config' first."
}

if (-not (Test-Path -LiteralPath $SshPublicKeyFile)) {
    throw "SSH public key file was not found: $SshPublicKeyFile"
}

function Invoke-A1LaunchAttempt {
    param(
        [string]$AvailabilityDomain,
        [int]$Ocpus,
        [int]$MemoryInGbs
    )

    $shapeConfig = @{
        ocpus       = $Ocpus
        memoryInGBs = $MemoryInGbs
    } | ConvertTo-Json -Compress

    $args = @(
        "compute", "instance", "launch",
        "--availability-domain", $AvailabilityDomain,
        "--compartment-id", $CompartmentId,
        "--subnet-id", $SubnetId,
        "--image-id", $ImageId,
        "--shape", "VM.Standard.A1.Flex",
        "--shape-config", $shapeConfig,
        "--display-name", $DisplayName,
        "--assign-public-ip", "true",
        "--boot-volume-size-in-gbs", $BootVolumeSizeInGbs.ToString(),
        "--ssh-authorized-keys-file", $SshPublicKeyFile,
        "--wait-for-state", "RUNNING",
        "--query", 'data.{id:id,displayName:"display-name",lifecycleState:"lifecycle-state",availabilityDomain:"availability-domain",shape:shape}',
        "--output", "json"
    )

    & oci @args
    return $LASTEXITCODE
}

$attempt = 0

while ($true) {
    $attempt++
    Write-Host "OCI A1 retry attempt $attempt started at $(Get-Date -Format o)" -ForegroundColor Cyan

    foreach ($availabilityDomain in $AvailabilityDomains) {
        Write-Host "Trying $availabilityDomain with 4 OCPU / 24 GB RAM..." -ForegroundColor Yellow
        Invoke-A1LaunchAttempt -AvailabilityDomain $availabilityDomain -Ocpus 4 -MemoryInGbs 24

        if ($LASTEXITCODE -eq 0) {
            Write-Host "Instance created successfully." -ForegroundColor Green
            exit 0
        }

        Write-Host "Capacity attempt failed. Trying next availability domain." -ForegroundColor DarkYellow
    }

    if ($MaxAttempts -gt 0 -and $attempt -ge $MaxAttempts) {
        throw "MaxAttempts reached without creating an instance."
    }

    Write-Host "No capacity found. Sleeping $SleepSeconds seconds..." -ForegroundColor DarkGray
    Start-Sleep -Seconds $SleepSeconds
}
