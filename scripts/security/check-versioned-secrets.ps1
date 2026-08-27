$ErrorActionPreference = 'Stop'

$trackedFiles = git ls-files
$rules = @(
    @{ Name = 'hardcoded database password'; Pattern = '(?m)^\s*(POSTGRES_PASSWORD|DATABASE_PASSWORD|DB_PASS)\s*[:=]\s*(?!\$\{|replace-with-|change-me|ci-|test-|<)[^\s#]+' },
    @{ Name = 'hardcoded application secret'; Pattern = '(?m)^\s*(JWT_SECRET|ADMIN_JWT_SECRET|API_TOKEN_SALT|TRANSFER_TOKEN_SALT|ENCRYPTION_KEY|NEXTAUTH_SECRET|INTERNAL_BFF_SHARED_SECRET|APP_KEYS)\s*[:=]\s*(?!\$\{|replace-with-|change-me|ci-|test-|<)[^\s#]+' },
    @{ Name = 'hardcoded JWT fallback'; Pattern = '(?i)process\.env\.JWT_SECRET\s*\|\|' },
    @{ Name = 'database URL password'; Pattern = '(?i)postgres(?:ql)?://[^\s:@]+:[^\s@${]+@' }
)

$findings = foreach ($file in $trackedFiles) {
    if ($file -match '\.(png|jpg|jpeg|gif|ico|pdf|lock)$') {
        continue
    }

    $content = Get-Content -LiteralPath $file -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) {
        continue
    }

    foreach ($rule in $rules) {
        foreach ($match in [regex]::Matches($content, $rule.Pattern)) {
            $line = ($content.Substring(0, $match.Index) -split "`n").Count
            "${file}:${line}: $($rule.Name)"
        }
    }
}

if ($findings) {
    $findings | ForEach-Object { Write-Error $_ }
    throw 'Versioned secret scan failed.'
}

Write-Output 'Versioned secret scan passed.'
