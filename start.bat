@echo off
echo Starting SOZ FiveM Server...
D:\FiveM\FXServer\FXServer.exe +set node_args "--allow-fs-read=* --allow-child-process" +exec server.cfg
pause
