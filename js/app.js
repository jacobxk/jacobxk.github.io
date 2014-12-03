var MnM = {
  init: function(){
    // extend jQuery
    this.jqueryHelpers();

    // init slab text
    this.slabText();

    // adds scroll and animation features
    this.initScroll();

    // starts mobile nav toggle
    this.mobileNav();

    // starts contact form
    this.contactForm();
  },
  slabText: function(){
    var resizeHome = function() {
      // Splash sections
      var screenH = $(window).height();
      var topnavH = $('#top-nav').is(':visible') ? $('#top-nav').height() : 0;

      $('#home').css({
        'min-height': screenH-topnavH+'px',
        'padding'   : '0px'
      });

      var splash = $('#home').find('.splash-text');
      splash.css({
        'margin-top': (splash.height() < screenH-topnavH ? ((screenH-topnavH)-splash.height())/2 : 20)+'px'
      });
    };

    resizeHome();

    // $(window).smartresize(function() {
    //   setTimeout(function() { resizeHome(); }, 500);
    // });

    $(window).bind('load', function() {
      $('.splash-text').slabText({ 'viewportBreakpoint': 380 });
      resizeHome();
    });
  },
  jqueryHelpers: function(){
    // Detects if device is mobile
    $.browser.device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

    // Checks if element is visible on viewport
    $.fn.visible = function(partial) {

      var $t            = $(this),
          $w            = $(window),
          viewTop       = $w.scrollTop(),
          viewBottom    = viewTop + $w.height(),
          _top          = $t.offset().top,
          _bottom       = _top + $t.height(),
          compareTop    = partial === true ? _bottom : _top,
          compareBottom = partial === true ? _top : _bottom;

      return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
    };
  },
  initScroll: function(){
    // helper scroll to function
    var scrollTo = function(){
      var section = this.attr('data-section');
      var to = '#'+section;
      if (section) {
        $(document).scrollTo($(to).position().top, 500);
      }
    };

    var $nav = $('#top-nav, #float-nav, #mobile-nav');
    $nav.find('.prevent-default, .go-to-top').click(function(e) {
      e.preventDefault();
      scrollTo.apply($(this));

      if ($('#mobile-nav').is(':visible')) {
        $('#mobile-nav ul').slideToggle();
      }
    });

    var $goToTop = $('.go-to-top');
    var $floatNav = $('#float-nav');

    $(window).scroll(function() {
      // display and hide floating nav
      if ($(document).scrollTop() <= 87) {
        $floatNav.stop(true, true).css({'margin-top': '-80px'});
        $goToTop.css({'display': 'none'});
      }
      else {
        $floatNav.stop(true, true).css({'margin-top': '0px'});
        $goToTop.css({'display': 'block'});
      }

      // animate product pictures on desktop
      if (!$.browser.device){
        $('.product').each(function(i, el) {
          var el = $(el);
          if (el.visible(true)) {
            el.addClass('pullUp');
          }
        });
      }
    });

    // Call scroll event once to set the stage
    $(window).scroll();

    // Scroll to next section
    $('.next-section').click(function(e){
      scrollTo.apply($(this));
    });
  },
  mobileNav: function(){
    // Handles mobile nav click
    $('#mobile-nav-icon').click(function() {
      $('#mobile-nav ul').slideToggle();
    });
  },
  contactForm: function(){
    $('#contact input, #contact textarea').each(function() {
      var placeholder = $(this).attr('data-placeholder');
      $(this).val(placeholder);
      $(this).data('placeholder', placeholder);

      $(this).focus(function() {
          if ($(this).val() == placeholder) { $(this).val(''); }
      });
      $(this).blur(function() {
          if (!$(this).val()) { $(this).val(placeholder); }
      });
    });

    /* Helper: Flashes validation messages on screen */
    var flash = (function(){
      var $val = $('.validation-message p');
      var $valWindow = $('.validation-message');

      var validationTimer;
      var flashMessage = function(msg){
        $val.html(msg);
        $valWindow.fadeIn(function() {
          clearTimeout(validationTimer);
          validationTimer = setTimeout(function() {
            $('.validation-message').fadeOut();
          }, 5000);
        });
      };

      return {
        flashMessage: flashMessage
      };

    })();

    $('.send-email').click(function(e) {
      e.preventDefault();

      // Form validation
      // name
      if (($('#contact_name').val() === '') || ($('#contact_name').val() === $('#contact_name').data('placeholder'))) {
        flash.flashMessage('Name is required.');
        return false;
      }

      // email
      if (($('#contact_email').val() === '') || ($('#contact_email').val() === $('#contact_email').data('placeholder'))) {
        flash.flashMessage('Your e-mail address is required.');
        return false;
      }
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!re.test($('#contact_email').val())) {
        flash.flashMessage('Your e-mail address appears to be invalid.');
        return false;
      }
      // budget
      var budget = $('#contact_budget').val();

      // message
      if (($('#contact_message').val() === '') || ($('#contact_message').val() === $('#contact_message').data('placeholder'))) {
        flash.flashMessage('Please leave us a commnet or sugguestion.');
        return false;
      }
      // End of form validation

      var self = $(this);
      var prevText = self.html();

      var params = $('#contact-footer').serialize();

      $.ajax({
        url: '/contact',
        type: 'POST',
        data: params,
        beforeSend: function (xhr) {
          $('#contact-footer input, #contact-footer textarea').attr('disabled', 'disabled');
          self.html('Sending...');
          $('.ajax-message').hide();
        },
        complete: function(data) {
          var response = {};
          if (data.responseText) response = JSON.parse(data.responseText);
          if (response.status && response.status === 'OK') {
            $('.ajax-message.success').fadeIn();
          } else {
            $('.ajax-message.error').not('.validation-message').fadeIn();
          }

          $('#contact-footer input, #contact-footer textarea').removeAttr('disabled');
          self.html(prevText);
        }
      });
    });
  }
};