<#
Usage:
  # provide URL and secret explicitly:
  .\send_signed_webhook.ps1 -Url "https://abcd-12-34-56.ngrok.io/api/clerk/webhooks" -Secret "whsec_..."

  # or export env vars and call without args:
  $env:CLERK_WEBHOOK_SECRET = 'whsec_...'
  .\send_signed_webhook.ps1 -Url "https://abcd-12-34-56.ngrok.io/api/clerk/webhooks"

The script reads payload.json from repo root. Create one if missing.
#>
param(
  [Parameter(Mandatory=$true)]
  [string]$Url,
  [string]$Secret
)

if (-not $Secret) {
  $Secret = $env:CLERK_WEBHOOK_SECRET
}

if (-not $Secret) {
  Write-Error "Missing secret. Pass -Secret or set CLERK_WEBHOOK_SECRET env var."
  exit 1
}

$payloadPath = Join-Path $PSScriptRoot '..\payload.json'
if (-not (Test-Path $payloadPath)) {
  Write-Host "payload.json not found at $payloadPath. Creating a sample payload..."
  $sample = @'
{
  "type": "user.created",
  "data": {
    "id": "auth_test_1",
    "email_addresses": [{ "email_address": "newuser@example.com" }],
    "first_name": "New",
    "full_name": "New User"
  }
}
'@
  $sample | Out-File -FilePath $payloadPath -Encoding utf8
}

$body = Get-Content -Raw -Path $payloadPath

# compute HMAC-SHA256 hex
$key = [System.Text.Encoding]::UTF8.GetBytes($Secret)
$hmacAlg = New-Object System.Security.Cryptography.HMACSHA256
$hmacAlg.Key = $key
$hmacBytes = $hmacAlg.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($body))
$hmac = ($hmacBytes | ForEach-Object { $_.ToString('x2') }) -join ''

Write-Host "POSTing to $Url with signature $hmac"

try {
  $resp = Invoke-RestMethod -Uri $Url -Method Post -Body $body -ContentType 'application/json' -Headers @{ 'x-clerk-signature' = $hmac }
  Write-Host "Response:`n" ($resp | ConvertTo-Json -Depth 3)
} catch {
  Write-Error "Request failed: $_"
}
