/*
 * bootstrap-editor v0.2
 * Copyright (C) 2013 Fat Panda, LLC.
 * MIT Licensed.
 */
!function($, ns) {

  var $window = $(window), $body = $('body');

  window.console = window.console || { log: function() {}, error: function() {} };

  var defaultEditorType = 'wysiwyg';

  var Editor = function($el, options) {
    this.$el = $el;
    this.init(options);
  };

  Editor.elIdx = 0;

  Editor.prototype = {

    init: function(options) {
      var that = this;
      
      this.options = options || {};
      
      this.options.type = ( this.options.type || this.$el.data('edit-as') || defaultEditorType ).toLowerCase();
      this.options.fullscreen = this.$el.data('fullscreen') !== undefined ? this.$el.data('fullscreen') : true;
      this.options.width = this.$el.data('width') || '100%';
      this.options.height = this.$el.data('height') || '100';
      this.options.maxHeight = this.$el.data('max-height') || $window.height() * 0.60;
      
      this.$el.addClass('bootstrap-editor bootstrap-editor-' + this.options.type);
      this.$el.addClass(this.classId = 'bootstrap-editor-' + (Editor.elIdx++));

      this.$el.on('init', function() {
        if (that.options.width === 'auto' || that.options.width === '100%') {
          var resizeTimeout, curWidth;
          setInterval(function() {
            // TODO: tie this interval to object destruction
            if (that.$el.parent().width() !== curWidth) {
              curWidth = that.$el.parent().width();
              clearTimeout(resizeTimeout);
              setTimeout($.proxy(that.fill, that), 100);
            }
          }, 100);
        }
      });

      this['init_' + this.options.type](options);
    },

    init_markdown: function() {

    },

    init_source: function() {

    },

    init_wysiwyg: function() {

      this.exec = function(cmd, ui, val, a) {
        this.tinymce.execCommand(cmd, ui, val, a);
      };

      this.val = function(val) {
        if (val !== undefined) {
          this.tinymce.setContent(val);
          if (this.$el.attr('placeholder') && ( !val || !val.trim() )) {
            this.tinymce.setContent(this.$el.attr("placeholder"));
            $(this.tinymce.getDoc()).find('body').addClass('placeheld');
          }
          return this;
        } else {
          val = this.tinymce.getContent();
          if (this.$el.attr('placeholder') && $(val).text().trim() === this.$el.attr('placeholder')) {
            return '';
          } else {
            return val;
          }
        }
      };

      this.fill = function() {
        this.tinymce.theme.resizeTo(this.$el.parent().width());
      };

      this.$el.hide();

      this.options.css = this.$el.data('tinymce-css') || 'css/tinymce-content.css';
      this.options.tools = this.$el.data('tinymce-tools') || false;
      this.options.status = this.$el.data('tinymce-status') || false;
      
      if (!window.tinyMCE) {
        console.error('tinyMCE not loaded');
        return false;
      }

      var that = this, $el = this.$el;

      tinyMCE.init({
        mode: 'specific_textareas',
        editor_selector: this.classId,
        content_css: this.options.css,
        width: this.options.width,
        height: this.options.height,
        theme_advanced_buttons1: '',
        plugins : 'fullscreen,autoresize',
        fullscreen_new_window: false,
        autoresize_bottom_margin: 20, // TODO: make this configurable
        autoresize_min_height: this.options.height,
        autoresize_max_height: this.options.maxHeight,
        fullscreen_settings: {
          theme_advanced_buttons1: ''
        },
        setup: function(ed) {
          $el.trigger('tinymce-setup', [ that ]);
        },
        oninit: function() {
          // setup an element we can work with
          that.tinymce = tinyMCE.get($el.attr('id'));
          that.tinymce.$el = $('#' + that.tinymce.editorContainer).css({ position: 'relative', display: 'inline-block' });
          that.tinymce.$el.addClass('bootstrap-mce-editor');
  
          // setup formatters
          that.tinymce.formatter.register('fontSizeHuge', {
            inline: 'span',
            styles: { 'fontSize': 'xx-large' }
          });

          // build-out UI
          that.$tools = $('<div class="tools"></div>');
          that.$tools.append(that.$btnFormatTools = $('<a class="tool-btn" href="#"><i class="icon-font"></i></a>'));
          that.$tools.append('<span class="tool-separator"></span>');
          that.$tools.append(that.$btnUpload = $('<a class="tool-btn" href="#"><i class="icon-paper-clip"></i></a>'));
          that.$tools.append(that.$formatTools = $('<div class="format-tools"><span class="arrow"></span></div>'));
          that.$formatTools.append(that.$btnFontFace = $('<a class="tool-btn" href="#"><label>Sans Serif</label><i class="icon-caret-down"></i><div class="select"></div></a>'));
          that.$formatTools.append('<span class="tool-separator"></span>');
          that.$formatTools.append(that.$btnFontSize = $('<a class="tool-btn" href="#"><i class="icon-text-height"></i><i class="icon-caret-down"></i><div class="select"></div></a>'));
          that.$btnFontSize.append(that.$btnFontSizeSelect = $('<div class="select"></div>'));
          that.$btnFontSizeSelect.append('<a class="font-size font-size-small" href="#">Small</a>');
          that.$btnFontSizeSelect.append('<a class="font-size font-size-normal" href="#">Normal</a>');
          that.$btnFontSizeSelect.append('<a class="font-size font-size-large" href="#">Large</a>');
          that.$btnFontSizeSelect.append('<a class="font-size font-size-huge" data-formatter="fontSize" data-formatter-value="Huge" href="#">Huge</a>');
          that.$formatTools.append('<span class="tool-separator"></span>');
          that.$formatTools.append(that.$btnBold = $('<a class="tool-btn" href="#" data-command="bold"><i class="icon-bold"></i></a>'));
          that.$formatTools.append(that.$btnItalic = $('<a class="tool-btn" href="#" data-command="italic"><i class="icon-italic"></i></a>'));
          that.$formatTools.append(that.$btnUnderline = $('<a class="tool-btn" href="#" data-command="underline"><i class="icon-underline"></i></a>'));
          that.$formatTools.append(that.$btnColor = $('<a class="tool-btn" href="#"><i class="icon-font icon-colors"></i><i class="icon-caret-down"></i><div class="select"></div></a>'));
          that.$formatTools.append('<span class="tool-separator"></span>');
          that.$formatTools.append(that.$btnOlist = $('<a class="tool-btn" href="#" data-command="insertorderedlist"><i class="icon-list-ol"></i></a>'));
          that.$formatTools.append(that.$btnUlist = $('<a class="tool-btn" href="#" data-command="insertunorderedlist"><i class="icon-list-ul"></i></a>'));
          that.$formatTools.append(that.$btnAlign = $('<a class="tool-btn" href="#"><i class="icon-align-left"></i><i class="icon-caret-down"></i></a>'));
          that.$btnAlign.append(that.$btnAlignSelect = $('<div class="select"></div>'));
          that.$btnAlignSelect.append(that.$btnAlignLeft = $('<a class="tool-btn" href="#" data-command="justifyleft"><i class="icon-align-left"></i></a>') );
          that.$btnAlignSelect.append(that.$btnAlignCenter = $('<a class="tool-btn" href="#" data-command="justifycenter"><i class="icon-align-center"></i></a>') );
          that.$btnAlignSelect.append(that.$btnAlignRight = $('<a class="tool-btn" href="#" data-command="justifyright"><i class="icon-align-right"></i></a>') );
          that.$btnAlignSelect.append('<br>');
          that.$btnAlignSelect.append(that.$btnOutdent = $('<a class="tool-btn" href="#" data-command="outdent"><i class="icon-indent-left"></i></a>') );
          that.$btnAlignSelect.append(that.$btnIndent = $('<a class="tool-btn" href="#" data-command="indent"><i class="icon-indent-right"></i></a>') );
          that.$btnAlignSelect.append(that.$btnQuote = $('<a class="tool-btn" href="#" data-command="formatblock" data-command-value="blockquote"><i class="icon-quote-left"></i></a>') );
          that.$formatTools.append('<span class="tool-separator"></span>');
          that.$formatTools.append(that.$btnRemove = $('<a class="tool-btn" href="#" data-command="removeformat"><i class="icon-remove"></i></a>'));
          
          that.$tools.find('a[data-command]').click(function() {
            var $this = $(this);
            that.tinymce.execCommand($this.data('command'), true, $this.data('command-value'));
            $this.parent('.select').parent('.tool-btn').removeClass('active');
            return false;
          });

          that.$tools.find('a.tool-btn:has(> .select)').click(function() {
            $(this).toggleClass('active');
            return false;
          });

          that.$tools.find('a[data-formatter="fontSize"]').click(function() {
            var size = $(this).data('data-formatter-value');
            that.tinymce.formatter.toggle('fontSize' + size);
            return false;
          });

          that.$btnFormatTools.click(function() {
            that.tinymce.focus();
            that.tinymce.$el
            that.$btnFormatTools.toggleClass('active');
            that.$formatTools[that.$btnFormatTools.hasClass('active') ? 'show' : 'hide']();
            that.$tools.toggleClass('format-open', that.$btnFormatTools.hasClass('active'));
            return false;
          });

          var hideAllSelectContainers = function() {
            that.$tools.find('.select:visible').each(function() {
              $(this).parent('.tool-btn').removeClass('active');
            });
          };

          $(document).on('click', hideAllSelectContainers);
          $el.bind('tinymce-focus', hideAllSelectContainers);

          that.tinymce.$el.append(that.$tools);
          that.tinymce.$el.append('<div class="dropzone"><span>Drop files here</span></div>');
          
          /*
          var uploader = new plupload.Uploader({
            runtimes : 'gears,html5,flash,silverlight,browserplus',
            // browse_button : 'pickfiles',
            // container : 'container',
            max_file_size : '10mb',
            url : 'upload.php',
            flash_swf_url : '/plupload/js/plupload.flash.swf',
            silverlight_xap_url : '/plupload/js/plupload.silverlight.xap',
            filters : [
              {title : "Image files", extensions : "jpg,gif,png"}
              // , {title : "Zip files", extensions : "zip"}
            ],
            resize : {width : 320, height : 240, quality : 90}
          });
          */

          // placeholder
          if ($el.attr('placeholder')) {
            if (!that.tinymce.getContent().length) {
              that.tinymce.setContent($el.attr("placeholder"));
              $(that.tinymce.getDoc()).find('body').addClass('placeheld');
            }
            that.tinymce.onKeyDown.add(function(ed, e) {
              if ($(that.tinymce.getContent()).text().trim() === $el.attr("placeholder")) {
                that.tinymce.setContent('');
                $(that.tinymce.getDoc()).find('body').removeClass('placeheld');
              }
            });
            $el.bind('tinymce-focus', function() {
              if ($(that.tinymce.getContent()).text().trim() === $el.attr("placeholder")) {
                that.tinymce.setContent('');
              }
              $(that.tinymce.getDoc()).find('body').removeClass('placeheld');
            });
            $el.bind('tinymce-blur', function() {
              /*
              For now just leave placeholder gone...
              Consider moving placeholder to an absolutely positioned element, instead of within content...
              if (!$(that.tinymce.getContent()).text().trim().length) {
                that.tinymce.setContent($el.attr("placeholder"));
                $(that.tinymce.getDoc()).find('body').addClass('placeheld');
                // updating content restores focus, so we have to remove the class here...
                that.tinymce.$el.removeClass('has-focus');
              }
              */
            });
            that.tinymce.onExecCommand.add(function(ed, cmd) {
              if (cmd === 'mceFullScreen') {
                $(that.tinymce.getDoc()).find('body').toggleClass('placeheld', that.tinymce.getContent() === $el.attr('placeholder'));
              }
            });
          }

          // proxy all events through $el
          that.tinymce.onEvent.add(function(ed, e) {
            $el.trigger('tinymce-'+e.type, [ that ]);
          });

          // proxy focus events
          $(that.tinymce.getDoc()).contents().find('body').focus(function() {
            that.tinymce.$el.addClass('has-focus');
            $el.trigger('tinymce-focus', [ that ]);
          }); 

          // proxy blur events
          $(that.tinymce.getDoc()).contents().find('body').blur(function() {
            that.tinymce.$el.removeClass('has-focus');
            $el.trigger('tinymce-blur', [ that ]);
          }); 

          // add standard full screen button?
          if (that.options.fullscreen) {
            var $fullscreen = $('<a href="#"><span class="fullscreen"></span></a>').css({ 
              position: 'absolute', 
              top: '5px', 
              right: '5px' 
            });
            that.tinymce.$el.append($fullscreen);
            $fullscreen.click(function() {
              if ($el.attr('placeholder')) {
                if ($(that.tinymce.getContent()).text().trim() === $el.attr("placeholder")) {
                  that.tinymce.setContent('');
                }
              }

              that.tinymce.execCommand('mceFullScreen');

              // setup ESC key to exit
              var exit = function(e) {
                if (e.keyCode == 27) { 
                  // Don't use that.tinymce here, it doesn't work
                  tinyMCE.execCommand('mceFullScreen');
                  $window.unbind('keyup', exit);
                  return false;
                }
              };

              $window.on('keyup', exit);
              return false;
            });
          }

          // hide the toolbar?
          if (!that.options.tools) {
            that.tinymce.$el.find('.mceToolbar').parent().hide(); 
          }
          // hide the status bar?
          if (!that.options.status) {
            that.tinymce.$el.find('.mceStatusbar').parent().hide();
          }

          $el.trigger('init', [ that, 'tinymce' ]);
          $el.trigger('tinymce-init', [ that ]);
        }
      });
    }

  };

  var dragActionTimeout;

  $window.on('dragover', function(e) {
    clearTimeout(dragActionTimeout);
    $body.addClass('dragging');
  });
  $window.on('dragend', function(e) {
    clearTimeout(dragActionTimeout);
    dragActionTimeout = setTimeout(function() {
      $body.removeClass('dragging');
    }, 500);
  });
  $window.on('dragleave', function(e) {
    clearTimeout(dragActionTimeout);
    dragActionTimeout = setTimeout(function() {
      $body.removeClass('dragging');
    }, 500);
  });

  $.fn[ns] = function(fn /*, ... */) {
    var args = Array.prototype.slice.apply(arguments);
    return this.each(function(i, el) {
      var $el = $(el), editor = $el.data(ns);
      if (!editor) {
        $el.data(ns, editor = new Editor($el, typeof fn !== "string" ? fn : {}));
      }
      if (typeof fn === "string") {
        editor[fn].apply(editor, args.slice(1));
      }
    });
  };

  $('[data-edit-as]').each(function() {
    $(this)[ns]();
  });

  $.valHooks['textarea'] = {
    set: function(el, val) {
      var $el = $(el);
      if ($el.data(ns)) {
        $el.data(ns).val(val);
      } else {
        el.value = val;
      }
    },
    get: function(el) {
      var $el = $(el);
      if ($el.data(ns)) {
        return $el.data(ns).val();
      } else {
        return el.value;
      }
    }
  };

}(jQuery, 'editor');