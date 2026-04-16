param(
    [int]$Port = 8082
)

$ErrorActionPreference = "Stop"

Write-Host "Checking listener on port $Port..."

$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listeners) {
    $pids = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $pids) {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "Stopping process on port ${Port}: PID=$procId NAME=$($proc.ProcessName)"
        } else {
            Write-Host "Stopping process on port ${Port}: PID=$procId"
        }
        Stop-Process -Id $procId -Force
    }

    $stillListening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($stillListening) {
        $fallbackPort = $Port + 1
        while (Get-NetTCPConnection -LocalPort $fallbackPort -State Listen -ErrorAction SilentlyContinue) {
            $fallbackPort++
        }
        Write-Warning "Port $Port is still in use. Switching to fallback port $fallbackPort."
        $Port = $fallbackPort
    }
}

Write-Host "Port $Port is free. Starting backend..."
Set-Location $PSScriptRoot

# Load optional local env file (KEY=VALUE) so SMTP credentials persist across sessions.
$envFiles = @(".env.local", ".env")
foreach ($envFile in $envFiles) {
    $envPath = Join-Path $PSScriptRoot $envFile
    if (Test-Path $envPath) {
        Write-Host "Loading environment from $envFile"
        Get-Content $envPath | ForEach-Object {
            $line = $_.Trim()
            if (-not $line -or $line.StartsWith("#")) { return }
            $parts = $line -split '=', 2
            if ($parts.Length -ne 2) { return }

            $key = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"').Trim("'")
            if ($key) {
                [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
            }
        }
        break
    }
}

[System.Environment]::SetEnvironmentVariable("SERVER_PORT", "$Port", "Process")
Write-Host "SERVER_PORT set to $Port"

if ([string]::IsNullOrWhiteSpace($env:DB_URL)) {
    $has3306 = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue
    $has3307 = Get-NetTCPConnection -LocalPort 3307 -State Listen -ErrorAction SilentlyContinue

    # Prefer 3307 first because docker-compose runs MySQL 8.x on host port 3307.
    # This avoids accidentally connecting to legacy local MySQL instances on 3306 (for example 5.5).
    if ($has3307) {
        $env:DB_URL = "jdbc:mysql://localhost:3307/fittrack_db?useSSL=false&serverTimezone=UTC"
    } elseif ($has3306) {
        $env:DB_URL = "jdbc:mysql://localhost:3306/fittrack_db?useSSL=false&serverTimezone=UTC"
    } else {
        Write-Error "No local MySQL listener detected on 3306 or 3307. Start MySQL (local or docker compose) or set DB_URL in backend/.env.local."
        exit 1
    }

    if ([string]::IsNullOrWhiteSpace($env:DB_USERNAME)) { $env:DB_USERNAME = "root" }
    Write-Host "DB_URL auto-set to $($env:DB_URL)"
}

# Configure safe mail defaults for local development.
if ([string]::IsNullOrWhiteSpace($env:MAIL_HOST)) { $env:MAIL_HOST = "smtp.ethereal.email" }
if ([string]::IsNullOrWhiteSpace($env:MAIL_PORT)) { $env:MAIL_PORT = "587" }

$hasMailUser = -not [string]::IsNullOrWhiteSpace($env:MAIL_USERNAME)
$hasMailPass = -not [string]::IsNullOrWhiteSpace($env:MAIL_PASSWORD)

if ($hasMailUser -and $hasMailPass) {
    if ([string]::IsNullOrWhiteSpace($env:MAIL_SMTP_AUTH)) { $env:MAIL_SMTP_AUTH = "true" }
    if ([string]::IsNullOrWhiteSpace($env:MAIL_FAIL_ON_ERROR)) { $env:MAIL_FAIL_ON_ERROR = "true" }
    if ([string]::IsNullOrWhiteSpace($env:MAIL_FROM)) { $env:MAIL_FROM = $env:MAIL_USERNAME }
    if ([string]::IsNullOrWhiteSpace($env:OTP_RETURN_CODE_IN_RESPONSE)) { $env:OTP_RETURN_CODE_IN_RESPONSE = "false" }
    if ([string]::IsNullOrWhiteSpace($env:PASSWORD_RESET_RETURN_LINK_IN_RESPONSE)) { $env:PASSWORD_RESET_RETURN_LINK_IN_RESPONSE = "false" }
    if ([string]::IsNullOrWhiteSpace($env:MAIL_SMTP_CONNECTION_TIMEOUT)) { $env:MAIL_SMTP_CONNECTION_TIMEOUT = "5000" }
    if ([string]::IsNullOrWhiteSpace($env:MAIL_SMTP_TIMEOUT)) { $env:MAIL_SMTP_TIMEOUT = "5000" }
    if ([string]::IsNullOrWhiteSpace($env:MAIL_SMTP_WRITE_TIMEOUT)) { $env:MAIL_SMTP_WRITE_TIMEOUT = "5000" }
    Write-Host "SMTP credentials detected: email delivery is enabled (secure mode)."
} else {
    # Secure mode only: never expose OTP/reset link via API.
    if ([string]::IsNullOrWhiteSpace($env:MAIL_SMTP_AUTH)) { $env:MAIL_SMTP_AUTH = "true" }
    if ([string]::IsNullOrWhiteSpace($env:MAIL_FAIL_ON_ERROR)) { $env:MAIL_FAIL_ON_ERROR = "true" }
    if ([string]::IsNullOrWhiteSpace($env:OTP_RETURN_CODE_IN_RESPONSE)) { $env:OTP_RETURN_CODE_IN_RESPONSE = "false" }
    if ([string]::IsNullOrWhiteSpace($env:PASSWORD_RESET_RETURN_LINK_IN_RESPONSE)) { $env:PASSWORD_RESET_RETURN_LINK_IN_RESPONSE = "false" }
    if ([string]::IsNullOrWhiteSpace($env:MAIL_SMTP_CONNECTION_TIMEOUT)) { $env:MAIL_SMTP_CONNECTION_TIMEOUT = "5000" }
    if ([string]::IsNullOrWhiteSpace($env:MAIL_SMTP_TIMEOUT)) { $env:MAIL_SMTP_TIMEOUT = "5000" }
    if ([string]::IsNullOrWhiteSpace($env:MAIL_SMTP_WRITE_TIMEOUT)) { $env:MAIL_SMTP_WRITE_TIMEOUT = "5000" }
    if ($env:MAIL_HOST -eq "smtp.ethereal.email") {
        Write-Error "MAIL_USERNAME/MAIL_PASSWORD are required for Ethereal secure mode. Add them in backend/.env.local then rerun this script."
    } else {
        Write-Error "MAIL_USERNAME/MAIL_PASSWORD are missing. Secure mode requires SMTP credentials."
    }
    exit 1
}

Write-Host "Backend URL: http://localhost:$Port"

./mvnw.cmd spring-boot:run
