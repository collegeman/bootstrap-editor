#!/bin/bash
currentpath=`pwd`
rm -fr ~/bootstrap-editor-gh-pages
git clone git@github.com:collegeman/bootstrap-editor.git ~/bootstrap-editor-gh-pages
cd ~/bootstrap-editor-gh-pages
git checkout gh-pages
rm -fr ~/bootstrap-editor-gh-pages/*
cp -R ${currentpath}/* ~/bootstrap-editor-gh-pages
git add -A
git commit -m "Updating docs"
git push origin gh-pages
cd ${currentpath}
rm -fr ~/bootstrap-editor-gh-pages