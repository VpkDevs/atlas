<#
.SYNOPSIS
  Atlas v8.0 triage script. Safely archives the bloat that accumulated in v7.x.

.DESCRIPTION
  This script does NOT delete anything. It moves files to _archive/v7_pre_triage/
  with timestamps preserved. The original Atlas behavior is unaffected — Atlas
  only reads files referenced from SKILL.md, and v8.0's SKILL.md does not
  reference any of the archived files.

  Designed for Vince's setup: C:\Users\MQ420_OL\.claude\skills\atlas (or wherever
  the skill lives). Run with -SkillPath to point elsewhere.

  ALWAYS RUN WITH -DryRun FIRST. Review the output. Then re-run without -DryRun.

.PARAMETER SkillPath
  Path to the atlas skill directory. Required.

.PARAMETER DryRun
  Show what would be moved without actually moving anything. Default: true.

.PARAMETER Force
  Run for real (i.e. -DryRun:$false). Equivalent to -DryRun:$false.

.EXAMPLE
  # Dry run (default — safe)
  .\atlas-triage.ps1 -SkillPath "C:\Users\MQ420_OL\.claude\skills\atlas"

.EXAMPLE
  # Real run (after reviewing dry-run output)
  .\atlas-triage.ps1 -SkillPath "C:\Users\MQ420_OL\.claude\skills\atlas" -Force

.NOTES
  Author: Atlas v8.0 upgrade
  Safe-by-default: requires explicit -Force to actually move files
  Idempotent: re-running has no effect once triage is complete
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$SkillPath,

    [bool]$DryRun = $true,

    [switch]$Force
)

# Force overrides DryRun
if ($Force) { $DryRun = $false }

# Validate path
if (-not (Test-Path -Path $SkillPath -PathType Container)) {
    Write-Host "ERROR: Skill path does not exist or is not a directory: $SkillPath" -ForegroundColor Red
    exit 1
}

$SkillPath = (Resolve-Path $SkillPath).Path

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Atlas v8.0 Triage Script" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Skill path:  $SkillPath"
Write-Host "  Mode:        $(if ($DryRun) { 'DRY RUN (no files will be moved)' } else { 'LIVE (files WILL be moved to _archive)' })" -ForegroundColor $(if ($DryRun) { 'Yellow' } else { 'Green' })
Write-Host ""

# Sanity check: is this actually an Atlas skill?
$skillMd = Join-Path $SkillPath "SKILL.md"
if (-not (Test-Path $skillMd)) {
    Write-Host "ERROR: No SKILL.md at $SkillPath — this does not look like the Atlas skill directory." -ForegroundColor Red
    exit 1
}

$skillContent = Get-Content $skillMd -Raw
if ($skillContent -notmatch "name:\s*atlas") {
    Write-Host "ERROR: SKILL.md at $SkillPath does not have 'name: atlas' frontmatter." -ForegroundColor Red
    exit 1
}

# Set up archive directory
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archiveDir = Join-Path $SkillPath "_archive\v7_pre_triage"
$archiveLog = Join-Path $archiveDir "TRIAGE_LOG.txt"

# Lists of what gets moved -------------------------------------------------

# Specific file names that are pure bloat (no canonical lowercase pair needed)
$bloatFiles = @(
    "ATLAS_IMPROVEMENT_PLAN.md",
    "atlas-improvement-plan.md",
    "ALL_FIXES_COMPLETE.md",
    "all-fixes-complete.md",
    "CONTINUATION_SUMMARY.md",
    "continuation-summary.md",
    "FINAL_SUMMARY.md",
    "final-summary.md",
    "FIXES_COMPLETE.md",
    "fixes-complete.md",
    "IDEAL_VS_ACTUAL.md",
    "ideal-vs-actual.md",
    "IMPROVEMENTS_DELIVERED.txt",
    "improvements-delivered.txt",
    "IMPROVEMENTS_INDEX.md",
    "improvements-index.md",
    "IMPROVEMENTS_SUMMARY.md",
    "improvements-summary.md",
    "IMPROVEMENT_GUIDE.md",
    "improvement-guide.md",
    "INCONSISTENCIES_FIXED.md",
    "inconsistencies-fixed.md",
    "MASTER_SUMMARY.md",
    "master-summary.md",
    "MODULE_AUDIT_v8.3.md",
    "module-audit-v8.3.md",
    "STRATEGIC_ARCHITECTURE_v8.3.md",
    "strategic-architecture-v8.3.md",
    "TREMENDOUS_IMPROVEMENTS_V8.1.md",
    "tremendous-improvements-v8.1.md",
    "WEAKEST_ASPECTS_FIXED.md",
    "weakest-aspects-fixed.md",
    "HOW_TO_RUN_ATLAS_ON_ATLAS.md",
    "how-to-run-atlas-on-atlas.md"
)

# Uppercase-pair files: archive the uppercase, keep the lowercase
# (only if both exist; otherwise rename or leave)
$uppercasePairs = @(
    @{ Upper = "ADVANCED_FEATURES.md";        Lower = "advanced-features.md" },
    @{ Upper = "ADVERSARIAL_AND_EPISTEMIC.md"; Lower = "adversarial-and-epistemic.md" },
    @{ Upper = "ATLAS_KERNEL.md";              Lower = "atlas-kernel.md" }
)

# Old-version modules (canonical name exists; -vN.md gets archived)
$oldVersionModules = @(
    "fusion-router-v2.md"  # canonical is fusion-router.md
)

# Top-level bloat that doesn't belong in a Claude skill at all
$rootBloat = @(
    "node_modules",        # directory
    "package.json",        # only relevant inside sub-projects
    "package-lock.json"    # only relevant inside sub-projects
)

# Nested skill recursion
$nestedSkillPaths = @(
    "atlas",               # may contain a recursive SKILL.md
    "atlas\atlas"          # may contain another recursive SKILL.md
)

# Build the operation list -------------------------------------------------

$operations = @()

foreach ($file in $bloatFiles) {
    $fullPath = Join-Path $SkillPath $file
    if (Test-Path $fullPath -PathType Leaf) {
        $operations += [PSCustomObject]@{
            Type   = "BLOAT"
            Source = $fullPath
            Target = Join-Path $archiveDir $file
            Reason = "Meta/summary/audit file forbidden by skill-hygiene.md"
        }
    }
}

foreach ($pair in $uppercasePairs) {
    $upperPath = Join-Path $SkillPath $pair.Upper
    $lowerPath = Join-Path $SkillPath $pair.Lower
    if ((Test-Path $upperPath -PathType Leaf) -and (Test-Path $lowerPath -PathType Leaf)) {
        $operations += [PSCustomObject]@{
            Type   = "DUPLICATE"
            Source = $upperPath
            Target = Join-Path $archiveDir $pair.Upper
            Reason = "Uppercase duplicate of $($pair.Lower) — kebab-case is v8.0 canonical"
        }
    }
}

foreach ($file in $oldVersionModules) {
    $fullPath = Join-Path $SkillPath $file
    if (Test-Path $fullPath -PathType Leaf) {
        $operations += [PSCustomObject]@{
            Type   = "OLDVERSION"
            Source = $fullPath
            Target = Join-Path $archiveDir $file
            Reason = "Old-version variant; canonical name supersedes"
        }
    }
}

foreach ($item in $rootBloat) {
    $fullPath = Join-Path $SkillPath $item
    if (Test-Path $fullPath) {
        $itemType = if (Test-Path $fullPath -PathType Container) { "directory" } else { "file" }
        $operations += [PSCustomObject]@{
            Type   = "ROOT-BLOAT"
            Source = $fullPath
            Target = Join-Path $archiveDir $item
            Reason = "$itemType does not belong at skill root"
        }
    }
}

# Handle recursive skill nesting separately (most important)
foreach ($nestedRel in $nestedSkillPaths) {
    $nestedFull = Join-Path $SkillPath $nestedRel
    $nestedSkill = Join-Path $nestedFull "SKILL.md"
    if (Test-Path $nestedSkill -PathType Leaf) {
        # The directory itself is the problem (it contains a SKILL.md)
        # Move the entire nested directory to archive
        $safeName = $nestedRel -replace "\\", "-"
        $operations += [PSCustomObject]@{
            Type   = "RECURSION"
            Source = $nestedFull
            Target = Join-Path $archiveDir "nested-skill-$safeName"
            Reason = "Recursive SKILL.md nesting — Doctor Check 4 violation"
        }
    }
}

# Report -------------------------------------------------------------------

if ($operations.Count -eq 0) {
    Write-Host "✅ No triage needed. Atlas is already clean." -ForegroundColor Green
    Write-Host ""
    exit 0
}

# Summarize
$bloatCount      = ($operations | Where-Object { $_.Type -eq "BLOAT" }).Count
$dupCount        = ($operations | Where-Object { $_.Type -eq "DUPLICATE" }).Count
$oldVerCount     = ($operations | Where-Object { $_.Type -eq "OLDVERSION" }).Count
$rootBloatCount  = ($operations | Where-Object { $_.Type -eq "ROOT-BLOAT" }).Count
$recursionCount  = ($operations | Where-Object { $_.Type -eq "RECURSION" }).Count

Write-Host "Summary of operations:" -ForegroundColor Cyan
Write-Host "  Meta/summary bloat files:    $bloatCount" -ForegroundColor White
Write-Host "  Uppercase duplicate files:   $dupCount" -ForegroundColor White
Write-Host "  Old-version modules:         $oldVerCount" -ForegroundColor White
Write-Host "  Root-level non-skill bloat:  $rootBloatCount" -ForegroundColor White
Write-Host "  Recursive skill copies:      $recursionCount" -ForegroundColor $(if ($recursionCount -gt 0) { 'Yellow' } else { 'White' })
Write-Host "  ────────────────────────────────"
Write-Host "  Total operations:            $($operations.Count)" -ForegroundColor Cyan
Write-Host ""

# Detail
Write-Host "Detail:" -ForegroundColor Cyan
foreach ($op in $operations) {
    $relSource = $op.Source.Substring($SkillPath.Length).TrimStart('\','/')
    $color = switch ($op.Type) {
        "RECURSION"  { "Yellow" }
        "ROOT-BLOAT" { "Yellow" }
        default      { "Gray" }
    }
    Write-Host ("  [{0,-10}] {1}" -f $op.Type, $relSource) -ForegroundColor $color
    Write-Host ("              → {0}" -f $op.Reason) -ForegroundColor DarkGray
}
Write-Host ""

# Execute or just report ---------------------------------------------------

if ($DryRun) {
    Write-Host "DRY RUN — no files were moved." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To execute, re-run with -Force:" -ForegroundColor Yellow
    Write-Host "  .\atlas-triage.ps1 -SkillPath `"$SkillPath`" -Force" -ForegroundColor White
    Write-Host ""
    exit 0
}

# Live mode — confirm one more time
Write-Host "⚠️  About to move $($operations.Count) items to:" -ForegroundColor Yellow
Write-Host "    $archiveDir" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Type 'YES' (exactly) to proceed"
if ($confirm -ne "YES") {
    Write-Host "Aborted." -ForegroundColor Red
    exit 1
}

# Ensure archive directory exists
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
}

# Initialize log
"Atlas v8.0 triage log" | Out-File $archiveLog -Encoding UTF8
"Run timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Add-Content $archiveLog
"Skill path: $SkillPath" | Add-Content $archiveLog
"Operations: $($operations.Count)" | Add-Content $archiveLog
"" | Add-Content $archiveLog

# Execute
$success = 0
$failed  = 0

foreach ($op in $operations) {
    try {
        # Ensure target parent exists
        $targetParent = Split-Path -Parent $op.Target
        if (-not (Test-Path $targetParent)) {
            New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
        }

        # If target already exists, append timestamp
        $finalTarget = $op.Target
        if (Test-Path $finalTarget) {
            $base = [System.IO.Path]::GetFileNameWithoutExtension($finalTarget)
            $ext  = [System.IO.Path]::GetExtension($finalTarget)
            $finalTarget = Join-Path (Split-Path -Parent $finalTarget) "$base.$timestamp$ext"
        }

        Move-Item -Path $op.Source -Destination $finalTarget -Force -ErrorAction Stop

        "$($op.Type): $($op.Source) → $finalTarget" | Add-Content $archiveLog
        Write-Host "  ✅ $($op.Source.Substring($SkillPath.Length).TrimStart('\','/'))" -ForegroundColor Green
        $success++
    } catch {
        "FAILED $($op.Type): $($op.Source) — $($_.Exception.Message)" | Add-Content $archiveLog
        Write-Host "  ❌ $($op.Source.Substring($SkillPath.Length).TrimStart('\','/')) — $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Triage complete." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Moved successfully: $success" -ForegroundColor Green
Write-Host "  Failed:             $failed" -ForegroundColor $(if ($failed -gt 0) { 'Red' } else { 'Gray' })
Write-Host "  Archive location:   $archiveDir" -ForegroundColor White
Write-Host "  Log file:           $archiveLog" -ForegroundColor White
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Cyan
Write-Host "    1. Run /atlas doctor to verify v8.0 health" -ForegroundColor White
Write-Host "    2. git add -A && git commit -m '[Atlas] v8.0 triage'" -ForegroundColor White
Write-Host "    3. git push" -ForegroundColor White
Write-Host ""
