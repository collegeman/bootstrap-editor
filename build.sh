echo 'Building dist now...'
rm -fr ./dist
mkdir dist
mkdir dist/js
mkdir dist/css
mkdir dist/font
cp js/bootstrap-editor.js ./dist/js
cp -R js/ckeditor ./dist/js
cp css/* ./dist/css
cp font/* ./dist/font
cp -R docs/js/tinymce ./dist/js
cp -R docs/js/plupload ./dist/js
rm -fr ./dist/js/tinymce/.git*
yuicompressor --preserve-semi ./dist/js/bootstrap-editor.js > ./dist/js/bootstrap-editor.min.js
yuicompressor --preserve-semi ./dist/css/bootstrap-editor.css > ./dist/css/bootstrap-editor.min.css
git add -A