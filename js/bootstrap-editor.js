!function($, ns) {

  window.console = window.console || { log: function() {}, error: function() {} };

  var defaultEditorType = 'tinymce';

  var Editor = function($el, options) {
    this.$el = $el.hide();
    this.init(options);
  };

  Editor.elIdx = 0;

  Editor.prototype = {

    init: function(options) {
      this.options = options || {};
      
      this.options.type = ( this.$el.data('edit-with') || defaultEditorType ).toLowerCase();
      this.options.fullscreen = this.$el.data('fullscreen') !== undefined ? this.$el.data('fullscreen') : true;

      this.$el.addClass('bootstrap-editor bootstrap-editor-' + this.options.type);
      this.$el.addClass(this.classId = 'bootstrap-editor-' + (Editor.elIdx++));
      this['init_' + this.options.type](options);
    },

    exec: function(cmd, ui, val, a) {
      if (this.options.type !== 'tinymce') {
        console.error('Editor is not type tinyMCE');
        return false;
      }
      this.tinymce.execCommand(cmd, ui, val, a);
    },

    init_tinymce: function() {
      this.options.css = this.$el.data('tinymce-css') || '/css/tinymce-content.css';
      this.options.width = this.$el.data('tinymce-width') || this.$el.parent().width();
      this.options.height = this.$el.data('tinymce-height') || '100';
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

          // placeholder
          if ($el.attr('placeholder')) {
            if (!that.tinymce.getContent().length) {
              that.tinymce.setContent('<span class="placeheld">' + $el.attr("placeholder") + '</span>');
            }
            that.tinymce.onKeyDown.add(function(ed, e) {
              if ($(that.tinymce.getContent()).text().trim() === $el.attr("placeholder")) {
                that.tinymce.setContent('');
              }
            });
            $el.bind('tinymce-blur', function() {
              if (!that.tinymce.getContent().length) {
                that.tinymce.setContent('<span class="placeheld">' + $el.attr("placeholder") + '</span>');
                // updating content restores focus, so we have to remove the class here...
                that.tinymce.$el.removeClass('has-focus');
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
            var $fullscreen = $('<a href="#"><span class="icon-fullscreen"></span></a>').css({ 
              position: 'absolute', 
              top: '5px', 
              right: '5px' 
            });
            that.tinymce.$el.append($fullscreen);
            $fullscreen.click(function() {
              that.tinymce.execCommand('mceFullScreen');

              // setup ESC key to exit
              var exit = function(e) {
                if (e.keyCode == 27) { 
                  // Don't use that.tinymce here, it doesn't work
                  tinyMCE.execCommand('mceFullScreen');
                  $(window).unbind('keyup', exit);
                  return false;
                }
              };

              $(window).on('keyup', exit);
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

  $('[data-edit-with]').each(function() {
    $(this)[ns]();
  });

}(jQuery, 'editor');