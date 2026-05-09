@echo off
set "APP=F:\Dropbox\ROV_Task_Manager\v16\ROV_Task_Manager_v16.html"
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "PROFILE=F:\Dropbox\ROV_Task_Manager\v16\.chrome-user-v16"
if exist "%CHROME%" (
  start "" "%CHROME%" --user-data-dir="%PROFILE%" --disable-cache "%APP%"
) else (
  start "" "%APP%"
)
