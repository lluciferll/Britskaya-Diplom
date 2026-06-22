# Восстановить проект до правки «убрать описательные тексты»
# Запуск: powershell -ExecutionPolicy Bypass -File _restore_before_ui_cleanup.ps1

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$H = Join-Path $env:USERPROFILE 'AppData\Roaming\Cursor\User\History'
$P = $PSScriptRoot

$pairs = @(
  @("$H\54c7f6f9\8ojC.tsx", "$P\src\app\page.tsx"),
  @("$H\-3b524c61\9xMx.tsx", "$P\src\app\login\page.tsx"),
  @("$H\-19594188\M3rw.tsx", "$P\src\components\home\HomeDashboard.tsx"),
  @("$H\-3c4edc9b\vMsc.tsx", "$P\src\app\campaigns\page.tsx"),
  @("$H\-4abbb3e2\jjK7.tsx", "$P\src\components\campaign\CampaignScreen.tsx"),
  @("$H\-6ab98693\8i5x.tsx", "$P\src\app\tools\page.tsx"),
  @("$H\3020c0ca\GaMf.tsx", "$P\src\app\generators\page.tsx"),
  @("$H\-3db8c405\d0nL.tsx", "$P\src\app\tools\encounter-builder\page.tsx"),
  @("$H\-36d15612\FOpN.tsx", "$P\src\app\tools\loot\page.tsx"),
  @("$H\-6d1f58f7\19Hs.tsx", "$P\src\app\tools\encounter\page.tsx"),
  @("$H\-24196c31\QnGj.tsx", "$P\src\app\tools\dice\page.tsx"),
  @("$H\39df7d60\MIti.tsx", "$P\src\app\generators\events\page.tsx"),
  @("$H\3d5a3b54\ZWKr.tsx", "$P\src\app\lore\page.tsx"),
  @("$H\2bef5823\SJtc.tsx", "$P\src\app\generators\shop\page.tsx"),
  @("$H\-288fb43\TaWF.tsx", "$P\src\app\atlas\page.tsx"),
  @("$H\-7cbe3478\jd3D.tsx", "$P\src\app\generators\emergency\page.tsx"),
  @("$H\3d2c2a7d\7pwT.tsx", "$P\src\app\reference\page.tsx"),
  @("$H\14d53c38\WT4o.tsx", "$P\src\app\generators\npc\page.tsx"),
  @("$H\-3be67620\xfRR.tsx", "$P\src\app\character-creator\page.tsx"),
  @("$H\-38ad3885\fvbS.tsx", "$P\src\components\session\SessionRoom.tsx"),
  @("$H\43d50d5d\y5Wv.tsx", "$P\src\components\maps\MapViewport.tsx"),
  @("$H\-5130f2ff\1XAH.tsx", "$P\src\components\campaign\campaignPanels.tsx"),
  @("$H\6794df36\sYmv.tsx", "$P\src\components\campaign\extended\EncounterLabPanel.tsx"),
  @("$H\-29d1e655\OiTd.tsx", "$P\src\components\campaign\extended\SessionPrepPanel.tsx"),
  @("$H\1f08ee98\RGpR.tsx", "$P\src\components\tools\DiceRoller.tsx"),
  @("$H\7d421243\tthh.tsx", "$P\src\components\maps\WatabouCityPanel.tsx"),
  @("$H\-1be8d15d\jZaH.tsx", "$P\src\components\CommandPalette.tsx"),
  @("$H\68097afc\SuGt.tsx", "$P\src\components\character\CharacterSheetWorkspace.tsx"),
  @("$H\6ca0b0f5\KKm5.tsx", "$P\src\components\maps\FaerunAtlasPanel.tsx"),
  @("$H\-59a6db12\0whU.tsx", "$P\src\components\campaign\CharactersPanel.tsx"),
  @("$H\1f58170f\QrSn.tsx", "$P\src\components\lore\LoreReferenceBrowser.tsx")
)

$n = 0
foreach ($pair in $pairs) {
  if (-not (Test-Path $pair[0])) {
    Write-Warning "SKIP (нет в истории): $($pair[0])"
    continue
  }
  Copy-Item -LiteralPath $pair[0] -Destination $pair[1] -Force
  $n++
  Write-Host "OK $($pair[1])"
}

Write-Host ""
Write-Host "Восстановлено файлов: $n"
Write-Host ""
Write-Host "Дальше: git add -A && git commit -m \"Restore UI texts before cleanup\" && git push origin main"
