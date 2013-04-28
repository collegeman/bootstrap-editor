#!/bin/bash
currentpath=`pwd`
rm -fr ~/bootstrap-editor-gh-pages
git clone git@github.com:collegeman/bootstrap-editor.git ~/bootstrap-editor-gh-pages
cd ~/bootstrap-editor-gh-pages
git checkout gh-pages
rm -fr ~/bootstrap-editor-gh-pages/*
cp -R ${currentpath}/docs/* ~/bootstrap-editor-gh-pages
rm ~/bootstrap-editor-gh-pages/css/bootstrap-editor.css
rm ~/bootstrap-editor-gh-pages/css/tinymce-content.css
rm ~/bootstrap-editor-gh-pages/js/bootstrap-editor.js
cp -R ${currentpath}/css/* ~/bootstrap-editor-gh-pages/css
cp -R ${currentpath}/js/* ~/bootstrap-editor-gh-pages/js
cp -R ${currentpath}/font/* ~/bootstrap-editor-gh-pages/font
rm -fr ~/bootstrap-editor-gh-pages/js/tinymce
cp -R ${currentpath}/docs/js/tinymce ~/bootstrap-editor-gh-pages/js
rm -fr ~/bootstrap-editor-gh-pages/js/tinymce/.git*
git add -A
git commit -m "Updating docs"
git push origin gh-pages
cd ${currentpath}
rm -fr ~/bootstrap-editor-gh-pages