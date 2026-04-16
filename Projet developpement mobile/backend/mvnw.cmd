@echo off
@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.2.0
@REM ----------------------------------------------------------------------------

setlocal

set "MAVEN_PROJECTBASEDIR=%~dp0"
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

if not exist "%WRAPPER_JAR%" (
  echo Downloading Maven wrapper jar...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$props = Get-Content -LiteralPath $env:WRAPPER_PROPERTIES; $line = $props | Select-String -Pattern '^wrapperUrl='; $url = $line.Line.Split('=')[1]; Invoke-WebRequest -Uri $url -OutFile $env:WRAPPER_JAR"
  if not exist "%WRAPPER_JAR%" (
    echo Failed to download Maven wrapper jar.
    exit /b 1
  )
)

set MAVEN_OPTS=
set MAVEN_CMD_LINE_ARGS=

if "%JAVA_HOME%"=="" (
  set "JAVA_EXE=java"
) else (
  set "JAVA_EXE=%JAVA_HOME%\bin\java"
)

"%JAVA_EXE%" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*

endlocal
