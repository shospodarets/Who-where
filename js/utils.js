/**
 * Who-where - JavaScipt- application
 * Copyright (c) 2011-2015 Serg Gospodarets ( https://gospodarets.com/ | sgospodarets@gmail.com )
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
// REQUIREDS:
// OTHER: whoWhere.addItems , whoWhere.deleteItems , whoWhere.editItems , whoWhere.init , whoWhere.JSONToUsers , whoWhere.usersToJSON, whoWhere.editLocation, whoWhere.editLocation
// THIS:  whoWhere.editItems
(function($){// start jQuery closure
$(document).unbind('ready.whoWhere.utils').bind('ready.whoWhere.utils',function(){// document ready
	whoWhere.utils.init();
});
if(!window.whoWhere){
	window.whoWhere = {};
}
whoWhere.utils = {};
whoWhere.utils.init = function(){// INIT
	whoWhere.utils.addBrowserClasses();
}
/* START COMMON */
whoWhere.utils.simpleEncode = function(str){
	return $.trim(str.toString()).replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
whoWhere.utils.encode = function(str){
	return $.trim(str.toString()).replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
whoWhere.utils.decode = function(str){
	return $.trim(str.toString()).replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
whoWhere.utils.log = function(){
	if(window.console && window.console.log && whoWhere.needLog){
		for (var i = 0; i < arguments.length; i++){
			console.log(arguments[i]);
		}
		console.log(' ');
	}
}
whoWhere.utils.addBrowserClasses = function(){
	var $body = $('body').eq(0);
	if($.browser.msie){
		$body.addClass('ie');
	}
}
whoWhere.utils.setPageMinWidth = function(width){
	var width;
	var $page = $('body').eq(0);
	var $horizontalElements = $('.map-wrapper,.people');
	if(width){
		$page.css('min-width',width);
	}else{
		width = 0;
		$horizontalElements.each(function(){
			var $this = $(this);
			width += parseInt($this.outerWidth(true));
		});
		$page.css('min-width',(width+5));
	}
}
/* END COMMON */
/* START LOADER */
whoWhere.utils.loader ={
	init: function(){
		var _html = $('html').eq(0);
		var _body = $('body').eq(0);
		var pageWrapper = $('#wrapper').length ? $('#wrapper') : _body;
		var _loader = _body.children('.loader-fader');
		if(!_loader.length){
			var _loaderFader = $('<div />')
				.addClass('loader-fader')
				.css({
					'position':'absolute',
					'top':0,
					'left':0,
					'width':pageWrapper.outerWidth(true),
					'height':pageWrapper.outerHeight(true),
					'opacity':0.5,
					'z-index':10000
				})
				.append('<div class="loader-fader-image" />');
			_body.append(_loaderFader);
		}
		whoWhere.utils.loader.resize();
	},
	resize: function(){
		if (typeof(window.alreadyRunningLoaderResize) == 'undefined') {// running one time only
			window.alreadyRunningLoaderResize = 1;
			$(window).resize(function(){
				var _html = $('html').eq(0);
				var _body = $('body').eq(0);
				var pageWrapper = $('#wrapper');
				var _loader = _body.children('.loader-fader');
				if (_loader.length) {
					_loader.css({
						'width': pageWrapper.outerWidth(true),
						'height': pageWrapper.outerHeight(true)
					})
				}
			});
		}
	},
	hide: function(){
		var _body = $('body').eq(0);
		var _loader = _body.children('.loader-fader');
		_loader.hide();
	},
	show: function(){
		whoWhere.utils.loader.init();
		var _body = $('body').eq(0);
		var _loader = _body.children('.loader-fader');
		_loader.show();
	}
}
/* END LOADER */
/* START FOR POPUP */
whoWhere.utils.setLeftTopClasses = function(widthWrapper,heightWrapper,$popup,leftClass,topClass){
	if( $popup.offset().left + $popup.outerWidth(true) >= widthWrapper.offset().left + widthWrapper.width() ){// set right/left class
		$popup.addClass(leftClass);
	}else{
		$popup.removeClass(leftClass);
	}
	if( $popup.offset().top + $popup.outerHeight(true) >= heightWrapper.offset().top + heightWrapper.height() ){// set top/bottom class
		$popup.addClass(topClass);
	}else{
		$popup.removeClass(topClass);
	}
}
/* END FOR POPUP */
/* START FOR DIALOG */
whoWhere.utils.getStringEditableDialog = function($dialogWrapper,$dialogInner,fieldText,dialogTitleText,postfixField,postfixFieldText){// get string editable dialog
	var dialogTitleText;
	var postfixField;// need for edit location
	var postfixFieldText;// need for edit location
	var $dialogClone = $dialogInner.clone();
	$dialogWrapper.data('popup',$dialogClone);
	$dialogWrapper.data('popup').dialog( "destroy" );
	$dialogWrapper.data('popup').dialog({
		modal:true,
		width: 355,
		title:dialogTitleText ? dialogTitleText :'Редактирование информации',
		position: 'center',
		resizable:false,
		open: function(event, ui) {
			var $dialog = $(this).closest('.ui-dialog');
			$(document).unbind("click.dialog").bind("click.dialog", function(e){
				whoWhere.utils.faderClick(e,$dialogWrapper);
			}); // bind hide dialog by fader click
			// set inner view
			var errorClass = 'validate-error';
			var validateFields =  $(this).find('.editable-text');
			validateFields.val(fieldText);
			var $postFixField = $(this).find(postfixField);
			if($postFixField.length){// need for edit location
				if(postfixFieldText){
					$postFixField.val(postfixFieldText);
				}
				validateFields = validateFields.add($postFixField);
			}
			validateFields.removeClass(errorClass);
			// set events
			validateFields.unbind('keydown.teamName').bind('keydown.teamName',function(e){// save on enter
				if(e.which == 13){
					$dialog.find('.ui-button-text:contains("Сохранить")').closest('.ui-button').trigger('click');
				}
			});
		},
		beforeClose: function(event, ui) {
			$(document).unbind('keydown.dialog'); // unbind moving focus in dialog window
			$(document).unbind("click.dialog"); // unbind hide dialog by fader click
			$dialogClone.remove();
			// trigger before close event
			var validateFields =  $(this).find('.editable-text');
			var $postFixField = $(this).find(postfixField);
			if($postFixField.length){// need for edit location
				validateFields = validateFields.add($postFixField);
			}
			$dialogWrapper.trigger({
				type:'getStringEditableDialog.beforeClose'
			});
		},
		buttons:{
			'Сохранить':function(){
				// validate on empty string
				var validateFields =  $(this).find('.editable-text');
				var $postFixField = $(this).find(postfixField);
				if($postFixField.length){// need for edit location
					validateFields = validateFields.add($postFixField);
				}
				var errorClass = 'validate-error';
				validateFields.each(function(){
					var validateField = $(this);
					if(!$.trim(validateField.val()).length){
						validateField.addClass(errorClass);
					}else{
						validateField.removeClass(errorClass);
					}
				});
				$postFixField.each(function(){
					var validateField = $(this);
					var validateFieldVal = $.trim(validateField.val());
					var _regLatin = /^([a-zA-Z0-9_])+$/;
					/* start locations test */
					var alreadyEditLocationClass = 'already-edit';
					var $locations = $('.locations-list li').not('.'+alreadyEditLocationClass);
					var postfixInUseAlready = 0;
					var $postfixInUseText = $postFixField.siblings('.error-message');
					if($locations && $locations.length){
						$locations.each(function(){
							var $thisLocation = $(this);
							var $thisPostfix = $thisLocation.attr('data-location');
							if(validateFieldVal==$thisPostfix){
								postfixInUseAlready = 1;
							}
						});
					}
					/* ens locations test */
					if(!_regLatin.test( validateFieldVal ) || postfixInUseAlready){// add error-view
						validateField.addClass(errorClass);
					}else{
						validateField.removeClass(errorClass);
					}
					if(postfixInUseAlready){// show/hide postfix in use text
						$postfixInUseText.show();
					}else{
						$postfixInUseText.hide();
					}
				});
				if(!validateFields.filter('.'+errorClass).length){
					if(validateFields.length==1){
						var validateField = validateFields;
						$dialogWrapper.trigger({
							type:'getStringEditableDialog.save',
							eventData:whoWhere.utils.simpleEncode(validateField.val())
						});
					}else{
						var returnValArray = [];
						validateFields.each(function(){
							var validateField = $(this);
							returnValArray.push(whoWhere.utils.simpleEncode(validateField.val()))
						});
						$dialogWrapper.trigger({
							type:'getStringEditableDialog.save',
							eventData:returnValArray
						});
					}
					validateFields.unbind('click.teamName');//unbind event
					$(this).dialog('close');
				}
			},
			'Отмена':function(){
				$(this).dialog('close');
			}
		}
	});
}
whoWhere.utils.getDataEditableDialog = function(params){
	var dialogTitleText = params.dialogTitleText;
	var $dialogWrapper = params.$dialogWrapper;
	var $dialogInner = params.$dialogInner;
	var $userLightBox = params.$userLightBox;
	
	var $dialogClone = $dialogInner.clone();
	$dialogWrapper.data('popup',$dialogClone);
	$dialogWrapper.data('popup').dialog( "destroy" );
	$dialogWrapper.data('popup').dialog({
		modal:true,
		width: 355,
		title:dialogTitleText ? dialogTitleText :'Информация о сотруднике',
		position: 'center',
		resizable:false,
		open: function(event, ui){
			// bind events
			$(document).unbind("click.dialog").bind("click.dialog", function(e){
				whoWhere.utils.faderClick(e,$dialogWrapper);
			}); // bind hide dialog by fader click
			// set inner view
			var $dialog = $(this).closest('.ui-dialog');
			if(whoWhere.editItems){
				whoWhere.editItems.editItem.syncLightDataFromUser($userLightBox,$dialog);
			}
			if(params.addItemDialog){
				$dialog.find('.swich-to-wrapper').hide();
			}
			// set events
			$dialog.undelegate("input:visible","keydown.teamName").delegate("input:visible", "keydown.teamName", function(e){// save on enter
				if(e.which == 13){
					$dialog.find('.ui-button-text:contains("Сохранить")').closest('.ui-button').trigger('click');
				}
			});
			$dialog.find('input:text:visible').eq(0).focus();// set focus to first input
			// set dialog position on center after image src change on first load
			$dialog.find('.user-image').unbind('load.getDataEditableDialog').one('load.getDataEditableDialog',function(e){
				$dialogWrapper.data('popup').dialog("option", "position", "center");
			});
		},
		beforeClose: function(event, ui) {
			$(document).unbind('keydown.dialog'); // unbind moving focus in dialog window
			$(document).unbind("click.dialog"); // unbind hide dialog by fader click
			$dialogClone.remove();
			if(typeof(params.beforeCloseCallback)=='function'){
				params.beforeCloseCallback();
			}
		},
		buttons:{
			'Сохранить':function(){
				var $dialog = $(this).closest('.ui-dialog');
				if(whoWhere.utils.validateEditDialog($dialog)){// if data in lightbox is valid
					if(typeof(params.validationSuccessCallback)=='function'){
						params.validationSuccessCallback();
					}
					if(whoWhere.editItems){
						whoWhere.editItems.editItem.syncUserDataFromLight($dialog,$userLightBox);
					}
					$(this).dialog('close');
				}
			},
			'Отмена':function(){
				$(this).dialog('close');
			}
		}
	});
}
whoWhere.utils.validateEditDialog = function($dialog){// VALIDATE
	var validateErrorClass ='validate-error';
	// validate emails
	var $basicEmail = $dialog.find('.user-basic-mail input:visible');
	var $emails = $basicEmail.add($dialog.find('.mails input:visible'));
	var _regEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	$emails.removeData('editItem.tested').each(function(){
		var $this = $(this);
		var $val = $this.val();
		if(!_regEmail.test($val) || !$.trim($val).length){
			$this.addClass(validateErrorClass);
		}else{
			$this.removeClass(validateErrorClass);
		}
	}).data('editItem.tested','true');
	// check basic mail for originaly
	$basicEmail.parent().removeClass(validateErrorClass);
	if(!$basicEmail.hasClass(validateErrorClass) && $basicEmail.val() != $basicEmail.attr('data-email-before-edit')){
		var userMail = 'mailto:' + $.trim( $basicEmail.val() ); 
		var $centerLink = $('.map .point[href="'+userMail+'"]');
		if($centerLink.length){
			$basicEmail.addClass(validateErrorClass);
			$basicEmail.parent().addClass(validateErrorClass);
		}
	}
	// validate phones
	var $phones = $dialog.find('.phones input:visible');
	var _regPhone = /^[0-9\-\+\ \()]+$/;
	$phones.removeData('editItem.tested').each(function(){
		var $this = $(this);
		var $val = $this.val();
		if(!_regPhone.test($val) || !$.trim($val).length){
			$this.addClass(validateErrorClass);
		}else{
			$this.removeClass(validateErrorClass);
		}
	}).data('editItem.tested','true');
	// validate visible fields for not empty
	$dialog.find('input:text:visible').each(function(){
		var $this = $(this);
		var $val = $this.val();
		if(!$this.data('editItem.tested')){// if fields not tested before
			if(!$.trim($val).length){
				$this.addClass(validateErrorClass);
			}else{
				$this.removeClass(validateErrorClass);
			}
		}
	});
	if(!$dialog.find('.'+validateErrorClass).length){// if dialog is valid
		return 1;
	}else{
		return 0;
	}
}
whoWhere.utils.faderClick = function(e,el,callback){ // function to hide dialog by fader click
	e = e || event;
	var t = e.target || e.srcElement;
	t = $(t);
	if(t.hasClass('ui-widget-overlay')){
		el.data('popup').dialog('close');
		if(typeof(callback)=='function'){
			callback();
		}
	}
}
whoWhere.utils.setDialogPosition = function(box,boxWidth,boxHeight,boxTop,boxLeft,drop,_relativeWidth,_relativeHeight){
	drop.removeClass('to-left to-top').css('margin-top',0);
	drop.css('visibility','hidden').show();
	if(boxTop+boxHeight+drop.outerHeight(true)>_relativeHeight){
		drop.css('margin-top','-'+ drop.outerHeight(true) +'px');
	}
	if(boxLeft+boxWidth+drop.outerWidth(true)>_relativeWidth){
		drop.addClass('to-left');
	}
	drop.css('visibility','visible');
	drop.hide();
}
/* END FOR DIALOG */
whoWhere.utils.URIHash = {
	dump : function(string)
	{
		var hash = string || window.location.hash;
		var dump = [];

		if(hash.length == 0) return dump;

		hash = hash.substring(string ? 0 : 1).split('&');

		for(var key in hash)
		{
			var pair = hash[key].split('=');

			if(pair.length != 2 || pair[0] in dump)
				return [];

			// escape for storage
			dump[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
		}
		return dump;
	},

	get : function(key, string)
	{
		return this.dump(string)[key];
	},

	set : function(key,value, string)
	{
		var dump = this.dump(string);
		dump[key] = value;

		return this.setLocation(dump, string);
	},

	setLocationToString: function(key, value){
		return decodeURIComponent( this.set(key,  value, window.location.href) );
	},

	remove : function(key){
		var dump = this.dump();
		delete dump[key];

		this.setLocation(dump);
	},

	setLocation : function(dump, string){
		var hash = [];

		for(var key in dump)
			hash.push(encodeURIComponent(key) + '=' + encodeURIComponent(dump[key]));

		var result = hash.join('&');
		if(!string){
			window.location.hash = result;
		}
		return result;
	}
}

})(jQuery);// end jQuery closure