@echo off

set PORT=5000
set URL=http://localhost:%PORT%/
echo Starte AKARBI
echo =======================
echo Dieses Fenster nicht schliessen.
echo.
echo Bitte im Browserfenster eigeben (sollte automatisch starten):
echo.
echo Training:
echo     %URL%#training
echo.
echo Erhebung:
echo     %URL%
echo.
echo Editor:
echo     %URL%/editor/beach-editor.html
echo.
echo.
echo Hinweise
echo =======================
echo.
echo Zum Probieren hinter die URL im Browserfenster einen Hash (#) angeben,
echo um Zusatzmodus zu aktivieren:
echo.
echo Debug (Alles Schneller, Kein Sound):
echo    %URL%#debug
echo Auto (Alles mit Ja beantworten):
echo    %URL%#auto
echo Nummer des Durchlaufs (1 - x):
echo    %URL%#5
echo Training (Laedt den Trainingsdatensatz):
echo    %URL%#training
echo.
echo Zur Kombination einfach Werte aneinanderfügen
echo Zum Testen beipielsweise:
echo    %URL%#debugauto
echo.
start /B call node.exe app.js
start /B cmd /C call start %URL%
start /B cmd /C call start %URL%/editor/beach-editor.html