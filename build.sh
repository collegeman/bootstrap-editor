rm -fr ./dist
mkdir dist
mkdir dist/js
mkdir dist/css
mkdir dist/font
cp js/bootstrap-editor.js ./dist/js
cp css/* ./dist/css
cp font/* ./dist/font
cp -R docs/js/tinymce ./dist/js
rm -fr ./dist/js/tinymce/.git*