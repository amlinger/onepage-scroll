/* ===========================================================
 * jquery-onepage-scroll.js v1.3.1
 * ===========================================================
 * Copyright 2013 Pete Rojwongsuriya.
 * http://www.thepetedesign.com
 *
 * Create an Apple-like website that let user scroll
 * one page at a time
 *
 * Credit: Eike Send for the awesome swipe event
 * https://github.com/peachananr/onepage-scroll
 *
 * License: GPL v3
 *
 * ========================================================== */

!function($){

  var defaults = {
    sectionContainer: "section",
    easing: "ease",
    animationTime: 1000,
    pagination: true,
    updateURL: false,
    keyboard: true,
    beforeMove: null,
    afterMove: null,
    loop: true,
    responsiveFallback: false,
    direction : 'vertical',
    threshold : 1,
    scrollCallback: null
	};

	/*------------------------------------------------*/
	/*  Credit: Eike Send for the awesome swipe event */
	/*------------------------------------------------*/

	$.fn.swipeEvents = function() {
      return this.each(function() {

        var startX,
            startY,
            $this = $(this);

        $this.bind('touchstart', touchstart);

        function touchstart(event) {
          var touches = event.originalEvent.touches;
          if (touches && touches.length) {
            startX = touches[0].pageX;
            startY = touches[0].pageY;
            $this.bind('touchmove', touchmove);
          }
        }

        function touchmove(event) {
          var touches = event.originalEvent.touches;
          if (touches && touches.length) {
            var deltaX = startX - touches[0].pageX;
            var deltaY = startY - touches[0].pageY;

            if (deltaX >= 50) {
              $this.trigger("swipeLeft");
            }
            if (deltaX <= -50) {
              $this.trigger("swipeRight");
            }
            if (deltaY >= 50) {
              $this.trigger("swipeUp");
            }
            if (deltaY <= -50) {
              $this.trigger("swipeDown");
            }
            if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
              $this.unbind('touchmove', touchmove);
            }
          }
        }

      });
    };


  $.fn.onepage_scroll = function(options){
    var settings = $.extend({}, defaults, options),
        el = $(this),
        sections = $(settings.sectionContainer)
        total = sections.length,
        status = "off",
        topPos = 0,
        leftPos = 0,
        lastAnimation = 0,
        quietPeriod = 500,
        paginationList = "",
        
        /* The scroll threshold  determines how many scrolls are needed in a 
           particular section before moving to the next section. This is cached,
           since it can be retreived using a user-defined method in which case
           it should only be called once on every visit to a scroll section. */
        _threshold = threshold(1),
        /* The current scroll position relative to the given threshold, which
           starts at 0 when in the bottom of scroll section, moving up to the
           specified threshold at the top (both exclusive if no transition is 
            to be made). */
        currentScroll   = _threshold;

    $.fn.transformPage = function(settings, pos, index) {
      if (typeof settings.beforeMove == 'function') settings.beforeMove(index);
      // if ($.isFunction(settings.scrollCallback)) settings.scrollCallback(currentScroll, _threshold, index);

      // Just a simple edit that makes use of modernizr to detect an IE8 browser and changes the transform method into
    	// an top animate so IE8 users can also use this script.
    	if($('html').hasClass('ie8')){
        if (settings.direction == 'horizontal') {
          var toppos = (el.width()/100)*pos;
          $(this).animate({left: toppos+'px'},settings.animationTime);
        } else {
          var toppos = (el.height()/100)*pos;
          $(this).animate({top: toppos+'px'},settings.animationTime);
        }
    	} else{
    	  $(this).css({
    	  "transform": ( settings.direction == 'horizontal' ) ? "translate3d(" + pos + "%, 0, 0)" : "translate3d(0, " + pos + "%, 0)",
         "transition": "all " + settings.animationTime + "ms " + settings.easing
    	  });
    	}
      $(this).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
        if (typeof settings.afterMove == 'function') settings.afterMove(index);
        // _threshold = threshold();
        // currentScroll = currentScroll > 0 ? 0 : _threshold;
        // if ($.isFunction(settings.scrollCallback)) settings.scrollCallback(currentScroll, _threshold, index);
      });

      // A successful transition to the next element is indicated by true.
      return true;
    }

    $.fn.moveDown = function() {
      var el = $(this)
      index = $(settings.sectionContainer +".active").data("index");
      current = $(settings.sectionContainer + "[data-index='" + index + "']");
      next = $(settings.sectionContainer + "[data-index='" + (index + 1) + "']");
      if(next.length < 1) {
        // The last element is already reached, and looping is disabled. Return
        // false to indicate that no transition will be done. 
        if (!settings.loop) return false;
        
        pos = 0;
        next = $(settings.sectionContainer + "[data-index='1']");
        

      } else {
        pos = (index * 100) * -1;
      }

      if (typeof settings.beforeMove == 'function') settings.beforeMove( next.data("index"));
      current.removeClass("active")
      next.addClass("active");
      if(settings.pagination == true) {
        $(".onepage-pagination li a" + "[data-index='" + index + "']").removeClass("active");
        $(".onepage-pagination li a" + "[data-index='" + next.data("index") + "']").addClass("active");
      }

      $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
      $("body").addClass("viewing-page-"+next.data("index"))

      if (history.replaceState && settings.updateURL == true) {
        var href = window.location.href.substr(0,window.location.href.indexOf('#')) + "#" + (index + 1);
        history.pushState( {}, document.title, href );
      }
      
      // We let transformPage indicate whether the transition is ok or not.
      return el.transformPage(settings, pos, next.data("index"));
    }

    $.fn.moveUp = function() {
      var el = $(this)
      index = $(settings.sectionContainer +".active").data("index");
      current = $(settings.sectionContainer + "[data-index='" + index + "']");
      next = $(settings.sectionContainer + "[data-index='" + (index - 1) + "']");

      if(next.length < 1) {

        // The first element is already reached, and looping is disabled. Return
        // false to indicate that no transition will be done. 
        if (!settings.loop) return false;

        pos = ((total - 1) * 100) * -1;
        next = $(settings.sectionContainer + "[data-index='"+total+"']");
      }else {
        pos = ((next.data("index") - 1) * 100) * -1;
      }
      if (typeof settings.beforeMove == 'function') settings.beforeMove(next.data("index"));
      current.removeClass("active")
      next.addClass("active")
      if(settings.pagination == true) {
        $(".onepage-pagination li a" + "[data-index='" + index + "']").removeClass("active");
        $(".onepage-pagination li a" + "[data-index='" + next.data("index") + "']").addClass("active");
      }
      $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
      $("body").addClass("viewing-page-"+next.data("index"))

      if (history.replaceState && settings.updateURL == true) {
        var href = window.location.href.substr(0,window.location.href.indexOf('#')) + "#" + (index - 1);
        history.pushState( {}, document.title, href );
      }

      // We let transformPage indicate whether the transition is ok or not.
      return el.transformPage(settings, pos, next.data("index"));
    }

    $.fn.moveTo = function(page_index) {
      current = $(settings.sectionContainer + ".active")
      next = $(settings.sectionContainer + "[data-index='" + (page_index) + "']");
      if(next.length > 0) {
        if (typeof settings.beforeMove == 'function') settings.beforeMove(next.data("index"));
        current.removeClass("active")
        next.addClass("active")
        $(".onepage-pagination li a" + ".active").removeClass("active");
        $(".onepage-pagination li a" + "[data-index='" + (page_index) + "']").addClass("active");
        $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
        $("body").addClass("viewing-page-"+next.data("index"))

        pos = ((page_index - 1) * 100) * -1;

        if (history.replaceState && settings.updateURL == true) {
            var href = window.location.href.substr(0,window.location.href.indexOf('#')) + "#" + (page_index - 1);
            history.pushState( {}, document.title, href );
        }
        el.transformPage(settings, pos, page_index);
      }
    }

    function responsive() {
      //start modification
      var valForTest = false;
      var typeOfRF = typeof settings.responsiveFallback

      if(typeOfRF == "number"){
      	valForTest = $(window).width() < settings.responsiveFallback;
      }
      if(typeOfRF == "boolean"){
      	valForTest = settings.responsiveFallback;
      }
      if(typeOfRF == "function"){
      	valFunction = settings.responsiveFallback();
      	valForTest = valFunction;
      	typeOFv = typeof valForTest;
      	if(typeOFv == "number"){
      		valForTest = $(window).width() < valFunction;
      	}
      }

      //end modification
      if (valForTest) {
        $("body").addClass("disabled-onepage-scroll");
        $(document).unbind('mousewheel DOMMouseScroll MozMousePixelScroll');
        el.swipeEvents().unbind("swipeDown swipeUp");
      } else {
        if($("body").hasClass("disabled-onepage-scroll")) {
          $("body").removeClass("disabled-onepage-scroll");
          $("html, body, .wrapper").animate({ scrollTop: 0 }, "fast");
        }


        el.swipeEvents().bind("swipeDown",  function(event){
          if (!$("body").hasClass("disabled-onepage-scroll")) event.preventDefault();
          el.moveUp();
        }).bind("swipeUp", function(event){
          if (!$("body").hasClass("disabled-onepage-scroll")) event.preventDefault();
          el.moveDown();
        });

        $(document).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(event) {
          event.preventDefault();
          var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
          init_scroll(event, delta);
        });
      }
    }
    
    function init_scroll(event, delta) {
        //console.log(delta);
        deltaOfInterest = delta;
        var timeNow = new Date().getTime(),
            cb = settings.scrollCallback,
            index = $(settings.sectionContainer + ".active").data("index");

        // Cancel scroll if currentScrollly animating or within quiet period
        if(timeNow - lastAnimation < quietPeriod + settings.animationTime)
            return event.preventDefault();

        // TODO: 
        // Pass index/element to callbacks
        // Check if last index
        // Make threshold a function
        // Put both in the customization list
        currentScroll = (delta > 0) ? Math.min(currentScroll + 1, _threshold+1)
                                    : Math.max(currentScroll - 1, -1);
        
        if (0 <= currentScroll && currentScroll <= _threshold) {
          if ($.isFunction(cb)) {
            cb(currentScroll, _threshold, index);
          }
          return event.preventDefault();
        }

        if (deltaOfInterest > 0 && el.moveUp()) {
          _threshold    = threshold(index-1);
          currentScroll = 0 ;
        } else if(deltaOfInterest < 0 && el.moveDown()) {
          _threshold    = threshold(index+1);
          currentScroll = _threshold;
        }

        lastAnimation = timeNow;
    }

    function threshold(current) {
      var th = settings.threshold;
      return $.isFunction(th) ? th(current) : th;
    }

    // Prepare everything before binding wheel scroll

    el.addClass("onepage-wrapper").css("position","relative");
    $.each( sections, function(i) {
      $(this).css({
        position: "absolute",
        top: topPos + "%"
      }).addClass("section").attr("data-index", i+1);


      $(this).css({
        position: "absolute",
        left: ( settings.direction == 'horizontal' )
          ? leftPos + "%"
          : 0,
        top: ( settings.direction == 'vertical' || settings.direction != 'horizontal' )
          ? topPos + "%"
          : 0
      });

      if (settings.direction == 'horizontal')
        leftPos = leftPos + 100;
      else
        topPos = topPos + 100;


      if(settings.pagination == true) {
        paginationList += "<li><a data-index='"+(i+1)+"' href='#" + (i+1) + "'></a></li>"
      }
    });

    el.swipeEvents().bind("swipeDown",  function(event){
      if (!$("body").hasClass("disabled-onepage-scroll")) event.preventDefault();
      el.moveUp();
    }).bind("swipeUp", function(event){
      if (!$("body").hasClass("disabled-onepage-scroll")) event.preventDefault();
      el.moveDown();
    });

    // Create Pagination and Display Them
    if (settings.pagination == true) {
      if ($('ul.onepage-pagination').length < 1) $("<ul class='onepage-pagination'></ul>").prependTo("body");

      if( settings.direction == 'horizontal' ) {
        posLeft = (el.find(".onepage-pagination").width() / 2) * -1;
        el.find(".onepage-pagination").css("margin-left", posLeft);
      } else {
        posTop = (el.find(".onepage-pagination").height() / 2) * -1;
        el.find(".onepage-pagination").css("margin-top", posTop);
      }
      $('ul.onepage-pagination').html(paginationList);
    }

    if(window.location.hash != "" && window.location.hash != "#1") {
      init_index =  window.location.hash.replace("#", "")

      if (parseInt(init_index) <= total && parseInt(init_index) > 0) {
        $(settings.sectionContainer + "[data-index='" + init_index + "']").addClass("active")
        $("body").addClass("viewing-page-"+ init_index)
        if(settings.pagination == true) $(".onepage-pagination li a" + "[data-index='" + init_index + "']").addClass("active");

        next = $(settings.sectionContainer + "[data-index='" + (init_index) + "']");
        if(next) {
          next.addClass("active")
          if(settings.pagination == true) $(".onepage-pagination li a" + "[data-index='" + (init_index) + "']").addClass("active");
          $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
          $("body").addClass("viewing-page-"+next.data("index"))
          if (history.replaceState && settings.updateURL == true) {
            var href = window.location.href.substr(0,window.location.href.indexOf('#')) + "#" + (init_index);
            history.pushState( {}, document.title, href );
          }
        }
        pos = ((init_index - 1) * 100) * -1;
        el.transformPage(settings, pos, init_index);
      } else {
        $(settings.sectionContainer + "[data-index='1']").addClass("active")
        $("body").addClass("viewing-page-1")
        if(settings.pagination == true) $(".onepage-pagination li a" + "[data-index='1']").addClass("active");
      }
    }else{
      $(settings.sectionContainer + "[data-index='1']").addClass("active")
      $("body").addClass("viewing-page-1")
      if(settings.pagination == true) $(".onepage-pagination li a" + "[data-index='1']").addClass("active");
    }

    if(settings.pagination == true)  {
      $(".onepage-pagination li a").click(function (){
        var page_index = $(this).data("index");
        el.moveTo(page_index);
      });
    }


    $(document).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(event) {
      event.preventDefault();
      var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
      if(!$("body").hasClass("disabled-onepage-scroll")) init_scroll(event, delta);
    });


    if(settings.responsiveFallback != false) {
      $(window).resize(function() {
        responsive();
      });

      responsive();
    }

    if(settings.keyboard == true) {
      $(document).keydown(function(e) {
        var tag = e.target.tagName.toLowerCase();

        if (!$("body").hasClass("disabled-onepage-scroll")) {
          switch(e.which) {
            case 38: // Arrow up
            case 33: // Page up
              if (tag != 'input' && tag != 'textarea') el.moveUp()
            break;
            case 40: // Arrow down
            case 32: // Spacebar
            case 34: // Page down
              if (tag != 'input' && tag != 'textarea') el.moveDown()
            break;
            case 36: // Home
              el.moveTo(1);
            break;
            case 35: // End
              el.moveTo(total);
            break;
            default: return;
          }
        }

      });
    }
    return false;
  }


}(window.jQuery);
