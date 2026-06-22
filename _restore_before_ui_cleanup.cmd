@echo off
set H=%USERPROFILE%\AppData\Roaming\Cursor\User\History
set P=%~dp0

copy /Y "%H%-4abbb3e2\jjK7.tsx" "%P%src\components\campaign\CampaignScreen.tsx"
copy /Y "%H%-3db8c405\d0nL.tsx" "%P%src\app\tools\encounter-builder\page.tsx"
copy /Y "%H%-6d1f58f7\19Hs.tsx" "%P%src\app\tools\encounter\page.tsx"
copy /Y "%H%39df7d60\MIti.tsx" "%P%src\app\generators\events\page.tsx"
copy /Y "%H%3d5a3b54\ZWKr.tsx" "%P%src\app\lore\page.tsx"
copy /Y "%H%2bef5823\SJtc.tsx" "%P%src\app\generators\shop\page.tsx"
copy /Y "%H%-288fb43\TaWF.tsx" "%P%src\app\atlas\page.tsx"
copy /Y "%H%-7cbe3478\jd3D.tsx" "%P%src\app\generators\emergency\page.tsx"
copy /Y "%H%14d53c38\WT4o.tsx" "%P%src\app\generators\npc\page.tsx"
copy /Y "%H%-3be67620\xfRR.tsx" "%P%src\app\character-creator\page.tsx"
copy /Y "%H%-38ad3885\fvbS.tsx" "%P%src\components\session\SessionRoom.tsx"
copy /Y "%H%43d50d5d\y5Wv.tsx" "%P%src\components\maps\MapViewport.tsx"
copy /Y "%H%-5130f2ff\1XAH.tsx" "%P%src\components\campaign\campaignPanels.tsx"
copy /Y "%H%6794df36\sYmv.tsx" "%P%src\components\campaign\extended\EncounterLabPanel.tsx"
copy /Y "%H%-29d1e655\OiTd.tsx" "%P%src\components\campaign\extended\SessionPrepPanel.tsx"
copy /Y "%H%1f08ee98\RGpR.tsx" "%P%src\components\tools\DiceRoller.tsx"
copy /Y "%H%7d421243\tthh.tsx" "%P%src\components\maps\WatabouCityPanel.tsx"
copy /Y "%H%68097afc\SuGt.tsx" "%P%src\components\character\CharacterSheetWorkspace.tsx"
copy /Y "%H%6ca0b0f5\KKm5.tsx" "%P%src\components\maps\FaerunAtlasPanel.tsx"
copy /Y "%H%-59a6db12\0whU.tsx" "%P%src\components\campaign\CharactersPanel.tsx"
copy /Y "%H%1f58170f\QrSn.tsx" "%P%src\components\lore\LoreReferenceBrowser.tsx"

cd /d "%P%"
git reset --hard c83f8c090da4a36d4facdbb353c725baffbb8e82
git log -1 --oneline
echo Done.
pause
