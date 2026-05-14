@REM Maven Wrapper startup batch script
@REM Adapted from https://github.com/apache/maven-wrapper
@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
set DIST_URL="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"
set MAVEN_HOME="%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9"

if not exist %WRAPPER_JAR% (
    echo Downloading Maven Wrapper...
    powershell -Command "Invoke-WebRequest -Uri %WRAPPER_URL% -OutFile %WRAPPER_JAR%"
)

if not exist %MAVEN_HOME% (
    echo Downloading Maven...
    mkdir %MAVEN_HOME% 2>nul
    powershell -Command "$zip='%USERPROFILE%\.m2\wrapper\maven.zip'; Invoke-WebRequest -Uri %DIST_URL% -OutFile $zip; Expand-Archive $zip -DestinationPath '%USERPROFILE%\.m2\wrapper\dists' -Force; Remove-Item $zip"
)

set MAVEN_CMD="%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9\bin\mvn.cmd"
%MAVEN_CMD% %*
