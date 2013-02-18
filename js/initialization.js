/**
 * Who-where - JavaScipt- application
 * Copyright (c) 2011-2012 Sergey Gospodarets ( http://gospodarets.com/ | sgospodarets@gmail.com )
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
// REQUIREDS:
// OTHER: whoWhere.utils
// THIS:  -
(function($){// start jQuery closure
$(document).unbind('ready.whoWhere.init').bind('ready.whoWhere.init',function(){// document ready
	$('body').eq(0).addClass('view-mode');// TURN ON EDIT_MODE (ADD VIEW MODE CLASS TO BODY)
	whoWhere.init();
});
if(!window.whoWhere){
	window.whoWhere = {};
}
whoWhere.init= function(){// INIT
	jQuery.expr[':'].Contains = function(a,i,m){// add selector to jquery
		return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase())>=0;
	}
	whoWhere.init.initHover();
	whoWhere.init.initInputs();
	whoWhere.init.initSearch();
	whoWhere.init.userInfoDialog();
	whoWhere.init.infoLightBox();
	if(whoWhere.utils){
		whoWhere.utils.setPageMinWidth();// SET MIN WIDTH ON PAGE INIT
	}
}
whoWhere.init.infoLightBox = function(){
	var $inboBtn = $('.info-box .btn-info');
	var url = $inboBtn.attr('href');
	var dataLoadedFlag = 0;
	var $body = $('body').eq(0);
	function showInfoDialog($infoData){
		$infoData.dialog( "destroy" );
		$infoData.dialog({
			modal:true,
			width: (parseInt($body.css('min-width')) - 30) || 900,
			title:'Описание',
			position: 'center',
			resizable:false,
			open: function(event, ui) {
				var $this = $(this);
				var $dialog = $this.closest('.ui-dialog');
				$(document).unbind("click.dialog").bind("click.dialog", function(e){
					e = e || event;
					var t = e.target || e.srcElement;
					t = $(t);
					if(t.hasClass('ui-widget-overlay')){
						$this.dialog('close');
					}
				}); // bind hide dialog by fader click
				$dialog.find('.screen-capture').unbind('load.infoLightBox').one('load.infoLightBox',function(e){
					$this.dialog("option", "position", "center");
				});
			},
			beforeClose: function(event, ui) {
				$(document).unbind('keydown.dialog'); // unbind moving focus in dialog window
				$(document).unbind("click.dialog"); // unbind hide dialog by fader click
			}
		});
	}
	$inboBtn.unbind('click.infoLightBox').bind('click.infoLightBox',function(e){
		e.preventDefault();
		if(dataLoadedFlag){
			var $infoData = $inboBtn.data('infoData');
			if($infoData){
				showInfoDialog($infoData);
			}
		}else{
			whoWhere.utils.loader.show();// show loader
			var request = $.ajax({
				url:url,
				type: "POST",
				success: function(infoData){
					var $infoData = $(infoData);
					$inboBtn.data('infoData',$infoData);
					showInfoDialog($infoData);
					dataLoadedFlag = 1;
				},
				error: function(err){
					alert('Ошибка при попытке получить данные по адресу: "'+url+'"');
				},
				complete: function(){
					whoWhere.utils.loader.hide();// hide loader
				}
			});
		}
	});
}
whoWhere.init.userInfoDialog = function(){
	// center
	var userMapWrapper = $('.map');
	userMapWrapper.undelegate(".holder","mousedown.userInfoDialog").delegate(".holder", "mousedown.userInfoDialog", function(e) {
		e.preventDefault();
		var $this = $(this);
		if($this.hasClass('no-action')){
			return;
		}
		if(// disable open lightbox on right click
			( e.which && e.which == 3 ) ||
			( e.button &&  e.button == 2 )
		){
			return false;
		}
		if (!$this.closest('.employee').data("draggable")){// not show dialog for draggable
			$this.trigger('showDialog.userInfoDialog');
		}
	}).undelegate(".holder","showDialog.userInfoDialog").delegate(".holder", "showDialog.userInfoDialog", function(e){
		var $dialogWrapper = $(this);
		var $dialogInner = $dialogWrapper.find('.user-lightbox');
		var $dialogClone = $dialogInner.clone();
		$dialogWrapper.data('popup',$dialogClone);
		$dialogWrapper.data('popup').dialog( "destroy" );
		$dialogWrapper.data('popup').dialog({
			modal:true,
			width: 355,
			title:'Информация о сотруднике',
			position: 'center',
			resizable:false,
			create: function(event, ui) {
				var $dialog = $(this).closest('.ui-dialog');
				whoWhere.utils.URIHash.set('userInfoDialog', $dialog.find('.user-basic-mail').html());
				$(document).unbind("click.dialog").bind("click.dialog", function(e){
					whoWhere.utils.faderClick(e,$dialogWrapper);
				}); // bind hide dialog by fader click
				// set inner view
				var $addInfoSection = $dialog.find('.additional-info');
				var $hiddenTriggers = $addInfoSection.find('.hidden-trigger');
				if($hiddenTriggers.length && $hiddenTriggers.length == $hiddenTriggers.filter('.hidden').length){
					// if no data to present on add section
					$addInfoSection.hide();
				}
			},
			beforeClose: function(event, ui) {
				$(document).unbind('keydown.dialog'); // unbind moving focus in dialog window
				$(document).unbind("click.dialog"); // unbind hide dialog by fader click
				$dialogClone.remove();
				whoWhere.utils.URIHash.remove('userInfoDialog');
			}
		});
	}).undelegate(".holder","click.userInfoDialog").delegate(".holder", "click.userInfoDialog", function(e){
		e.preventDefault();// prevent click event
	});
	// side
	var userSideWrapper = $('.people');
	userSideWrapper.undelegate(".team a","click.userInfoDialog").delegate(".team a", "click.userInfoDialog", function(e) {
		e.preventDefault();
		var $this = $(this);
		var target = $('a.point[href="'+$this.attr('href')+'"]');
		target.trigger('showDialog.userInfoDialog');// show user dialog
	});
}
whoWhere.init.userInfoDialog.showFromHash = function(){
	// check hash
	var userDialogFromHash = whoWhere.utils.URIHash.get('userInfoDialog');
	if(userDialogFromHash){
		var target = $('a.point[href="mailto:'+userDialogFromHash+'"]');
		target.trigger('showDialog.userInfoDialog');// show user dialog
	}
}
whoWhere.init.initInputs = function() {// clear inputs onfocus
	var _inputs = $('input:text, input:password, textarea');
	_inputs.each(function(){
		var _input = $(this);
		var _val = _input.val();
		if(_val.length) {
			_input.unbind('focus.initInputs').bind('focus.initInputs',function(){
				if(_input.val() == _val) _input.val('');
			});
			_input.unbind('blur.initInputs').bind('blur.initInputs',function(){
				if(!_input.val().length) _input.val(_val);
			});
		}
	});
}
whoWhere.init.initHover = function(){// show info on hover from list
	var _hoverClass = 'highlight';
	var activeClass = 'active-view';
	var zIndexClass = 'z-index';
	var peopleSideWrapper = $('.people');
	var peopleOnMapWrapper = $('.map');
	// side
	peopleSideWrapper.undelegate(".title","mouseenter.initHover").delegate(".title", "mouseenter.initHover", function(e) {
		var link = $(this);
		var target = $('a.point[href="'+link.attr('href')+'"]');
		// hide drop
		var holder = target.closest('.holder');
		holder.trigger('custom.showDrop');
	}).undelegate(".title","mouseleave.initHover").delegate(".title", "mouseleave.initHover", function(e) {
		var link = $(this);
		var target = $('a.point[href="'+link.attr('href')+'"]');
		// show drop
		var holder = target.closest('.holder');
		holder.trigger('custom.hideDrop');
	});
	// center
	peopleOnMapWrapper
	.undelegate(".employee .holder","mouseenter.initHover").delegate(".employee .holder", "mouseenter.initHover", function(e) {
		var box = $(this);
		// highlight side link
		var link = box.find('.point');
		var target = peopleSideWrapper.find('.title[href="'+link.attr('href')+'"]');
		target.closest('.title-wrapper').addClass(_hoverClass);
		// show drop
		box.trigger('custom.showDrop');
	}).undelegate(".employee .holder","mouseleave.initHover").delegate(".employee .holder", "mouseleave.initHover", function(e) {
		var box = $(this);
		// unhighlight side link
		var link = box.find('.point');
		var target = peopleSideWrapper.find('.title[href="'+link.attr('href')+'"]');
		target.closest('.title-wrapper').removeClass(_hoverClass);
		// hide drop
		box.trigger('custom.hideDrop');
	}).undelegate(".employee .holder","custom.showDrop").delegate(".employee .holder", "custom.showDrop", function(e){
		var box = $(this);
		// show drop
		var drop = box.find('div.user-popup');
		var boxWidth = box.outerWidth();// const
		var boxHeight = box.outerHeight();// const
		var boxTop = parseInt(box.closest('.employee').css('top'));
		var boxLeft = parseInt(box.closest('.employee').css('left'));
		whoWhere.utils.setDialogPosition(box,boxWidth,boxHeight,boxTop,boxLeft,drop,peopleOnMapWrapper.width(),peopleOnMapWrapper.height());
		box.parent().parent().addClass(activeClass);
		drop.show();
	}).undelegate(".employee .holder","custom.hideDrop").delegate(".employee .holder", "custom.hideDrop", function(e){
		var box = $(this);
		if(box.data('copyLinkClicked')) return;
		// hide drop
		var drop = box.find('div.user-popup');
		box.parent().parent().removeClass(activeClass);
		drop.hide();

		var link = box.find('.point');
		var target = peopleSideWrapper.find('.title[href="'+link.attr('href')+'"]');
		target.closest('.title-wrapper').removeClass(_hoverClass);
	}).undelegate(".copy-link","mouseenter.userInfoPopup").delegate(".copy-link", "mouseenter.userInfoPopup", function(e){
		var $this = $(this);
		if(!$this.data('zclip')){
			$this.data('zclip',true);
			var $box = $this.closest('.holder');
			$this.find('.zclip').zclip({
				path:'../inc/swf/ZeroClipboard.swf',
				copy: whoWhere.utils.URIHash.setLocationToString('userInfoPopup',  $box.find('.user-basic-mail').html())
			}).on('mouseleave',function(e){
				e.stopPropagation();
			});
		}
	})
	.undelegate(".copy-link","mousedown.userInfoPopup").delegate(".copy-link", "mousedown.userInfoPopup", function(e){
		e.stopPropagation();

		var $this = $(this);
		var $box = $this.closest('.holder');
		$box.data('copyLinkClicked', true);
		setTimeout(function(){
			$box.data('copyLinkClicked', false);
		},0)
	});
}
whoWhere.init.initHover.showFromHash = function(){
	var userPopupFromHash = whoWhere.utils.URIHash.get('userInfoPopup');
	if(userPopupFromHash){
		var _hoverClass = 'highlight';
		var $userOnMap = $('a.point[href="mailto:'+userPopupFromHash+'"]');
		$userOnMap.trigger('custom.showDrop');
		var $userOnSide = $('.title[href="mailto:'+userPopupFromHash+'"]');
		$userOnSide.closest('.title-wrapper').addClass(_hoverClass);
	}
}
whoWhere.init.initSearch = function(){// show popups when typing in field
	var _input = $(".search-box .text");

	function reset() {
		$('.map .employee .holder').trigger('mouseleave.initHover');
	}
	function doSearch() {
		reset();
		if(_input.val().length > 2) {
			var results = $('.map .employee .holder').filter(':Contains('+_input.val()+')');
			results.trigger('mouseenter.initHover');
		}
	}
	_input
		.unbind('keyup.initSearch').bind('keyup.initSearch',function(){
			doSearch()
		}).unbind('blur.initSearch').bind('blur.initSearch',function(){
			reset();
		}).unbind('focus.initSearch').bind('focus.initSearch',function(){
			doSearch();
		}).unbind('keydown.initSearch').bind('keydown.initSearch',function(e){
			if(e.keyCode == 27) {
				_input.val('').blur();
				reset();
			}
			if(e.keyCode == 13) {
				return false;
			}
		});
}
})(jQuery);// end jQuery closure