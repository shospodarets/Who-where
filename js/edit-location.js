/**
 * Who-where - JavaScipt- application
 * Copyright (c) 2011-2012 Sergey Gospodarets ( http://gospodarets.com/ | sgospodarets@gmail.com )
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
// REQUIREDS:
// OTHER: -
// THIS:  whoWhere.JSONToUsers whoWhere.utils , whoWhere.usersToJSON.run
(function($){// start jQuery closure
$(document).bind('ready.whoWhere.editLocation').bind('ready.whoWhere.editLocation',function(){// document ready
	whoWhere.editLocation.init();
});
if(!window.whoWhere){
	window.whoWhere = {};
}
whoWhere.editLocation = {};
whoWhere.editLocation.init = function(){// INIT
	whoWhere.editLocation.locationPhotoEdit();
	whoWhere.editLocation.removeLocation();
	whoWhere.editLocation.addLocation();
	whoWhere.editLocation.editLocationProps();
}
/* START ADD LOCATION */
whoWhere.editLocation.addLocation = function(){
	var $switchersWrapper = $('.locations-list');
	var activeClass = 'active';
	var $addLocation = $('.add-location');
	$addLocation.unbind('click.addLocation').bind('click.addLocation',function(e){
		e.preventDefault();
		var $this = $(this);
		var addLocationDialogWrapper = $('.examples-wrapper .edit-location-dialog-wrapper');
		whoWhere.utils.getStringEditableDialog(addLocationDialogWrapper,addLocationDialogWrapper.find('.edit-location-dialog'),'','Данные новой локации','.postfix-text')
		addLocationDialogWrapper.unbind('getStringEditableDialog.save').bind('getStringEditableDialog.save',function(trigger){
			// construct switcher
			var $switcherExample = $('.location-switcher-example li').clone();
			$switcherExample.find('.text').html(trigger.eventData[0]);
			$switcherExample.attr({
				'data-location':trigger.eventData[1],
				'title':'Постфикс в имени файла с данными- "'+trigger.eventData[1]+'"'
			});
			// append to other
			$switchersWrapper.find('li').removeClass(activeClass);
			if(whoWhere.JSONToUsers && whoWhere.JSONToUsers.cleanContent){// clean content
				whoWhere.JSONToUsers.cleanContent();
			}
			$switcherExample.addClass(activeClass);
			$switchersWrapper.append($switcherExample);
			if(whoWhere.usersToJSON && whoWhere.usersToJSON.run){// save new location in file
				whoWhere.usersToJSON.run();
			}
		});
	});
}
/* END ADD LOCATION */
/* START REMOVE LOCATION */
whoWhere.editLocation.removeLocation = function(){
	var $switchersWrapper = $('.locations-list');
	var activeClass = 'active';
	$switchersWrapper.undelegate(".remove","click.removeLocation").delegate(".remove", "click.removeLocation", function(e){
		e.preventDefault();
		var $this = $(this);
		var $switcher = $this.closest('li');
		var $othersSwitchers = $switchersWrapper.find('li').not($switcher);
		if($othersSwitchers.length){// if switcher not last
			whoWhere.editLocation.getDeleteLightBox({
				$dialogEl:$('.delete-location-dialog'),
				dialogText:$.trim($switcher.find('.text').text()),
				callback:function(){
					if(whoWhere.JSONToUsers && whoWhere.JSONToUsers.cleanContent){// clean content
						whoWhere.JSONToUsers.cleanContent();
					}
					$switcher.remove();// remove current switcher
					$othersSwitchers.removeClass(activeClass);
					$othersSwitchers.eq(0).addClass(activeClass);
					whoWhere.JSONToUsers.run();// parse new active location
				}
			});
		}else{
			alert('Нельзя удалить текущую локацию, т.к. в документе должна присутствовать хотя бы одна локация');
		}
	});
}
/* END REMOVE LOCATION */
/* START EDIT PROPS */
whoWhere.editLocation.editLocationProps = function(){
	var $switchersWrapper = $('.locations-list');
	var activeClass = 'active';
	var alreadyEditLocationClass = 'already-edit';
	$switchersWrapper.undelegate(".options","click.editLocationProps").delegate(".options", "click.editLocationProps", function(e){
		e.preventDefault();
		var $this = $(this);
		var $switcher = $this.closest('li');
		$switcher.addClass(alreadyEditLocationClass);
		var editLocationDialogWrapper = $('.examples-wrapper .edit-location-dialog-wrapper');
		whoWhere.utils.getStringEditableDialog(editLocationDialogWrapper,editLocationDialogWrapper.find('.edit-location-dialog'),$.trim($switcher.find('.text').text()),'Редактирование данных локации','.postfix-text',$.trim($switcher.attr('data-location')))
		editLocationDialogWrapper.unbind('getStringEditableDialog.save').bind('getStringEditableDialog.save',function(trigger){
			// edit switcher attributes
			$switcher.find('.text').html(trigger.eventData[0]);
			$switcher.attr({
				'data-location':trigger.eventData[1],
				'title':'Постфикс в имени файла с данными- "'+trigger.eventData[1]+'"'
			});
		});
		editLocationDialogWrapper.unbind('getStringEditableDialog.beforeClose').bind('getStringEditableDialog.beforeClose',function(trigger){
			$switcher.removeClass(alreadyEditLocationClass);
		});
	});
}
/* END EDIT PROPS */
/* START LOCATION PHOTO EDIT */
whoWhere.editLocation.currentEditLocation = $([]);
whoWhere.editLocation.uploadLocationCallback = function(response){// upload location callback processing
	whoWhere.utils.log(response);
	var $response = $($.parseXML(response));
	if($response.find('original_image').length){// picture published
		var responseImg = $('<img />').appendTo($('.utils-box'));
		responseImg.unbind('load.uploadCallback').bind('load.uploadCallback',function(){
			/* start reset position and dimension */
			var mapWrapper = $('.map');
			var oldWidth = parseInt(mapWrapper.width());
			var oldHeight = parseInt(mapWrapper.height());
			// calc new dimension
			var newWidth = parseInt(responseImg.width()) || 0;
			var minWidth = parseInt(mapWrapper.css('min-width')) || 0;
			newWidth = Math.max(newWidth,minWidth);
			var newHeight = parseInt(responseImg.height()) || 0;
			var minHeight = parseInt(mapWrapper.css('min-height')) || 0;
			newHeight = Math.max(newHeight,minHeight);
			if(newWidth && newHeight){// if new dimension
				var xRatio = oldWidth/newWidth;
				var yRatio = oldHeight/newHeight;
				var points = mapWrapper.find('.employee');
				var pointW = parseInt(points.eq(0).outerWidth(true));
				var pointH = parseInt(points.eq(0).outerHeight(true));
				var maxTop = newHeight - pointH;
				var maxLeft = newWidth - pointW;
				points.draggable( "destroy" );// destroy draggable to prevent plugin recalc position glitches
				points.each(function(){
					var $this = $(this);
					var $thisTop = parseInt($this.css('top'));
					var $thisLeft = parseInt($this.css('left'));
					var newTop = $thisTop/xRatio;
					newTop = Math.min(newTop,maxTop);
					var newLeft = $thisLeft/yRatio;
					newLeft = Math.min(newLeft,maxLeft);
					$this.css({
						top:newTop,
						left:newLeft
					});
				});
				mapWrapper.css({
					'width':newWidth,
					'height':newHeight
				});
			}
			/* end reset position and dimension */
			var _background = 'url('+ responseImg.attr('src')+ ')';
			whoWhere.editLocation.currentEditLocation
				.css('background-image',_background)
				.attr('data-background',_background);
			whoWhere.utils.loader.hide();// hide loader
			whoWhere.editLocation.currentEditLocation = $([]);// clean current location after operation
			responseImg.remove();// remove temp img
			if(whoWhere.utils){
				whoWhere.utils.setPageMinWidth();// RESET MIN WIDTH TO PAGE
			}
		}).unbind('error.uploadCallback').bind('error.uploadCallback',function(){
			alert('Image is broken or not an image');
			whoWhere.utils.loader.hide();// hide loader
			responseImg.remove();// remove temp img
		}).unbind('abort.uploadCallback').bind('abort.uploadCallback',function(){
			alert('Image load is abort');
			whoWhere.utils.loader.hide();// hide loader
			responseImg.remove();// remove temp img
		});
		responseImg.attr('src',$response.find('original_image').text());
	}else if($(response).find('error_code').length){// server error
		alert('Sorry, shit happens. Server Error Code is: '+$(response).find('error_code').text());
		whoWhere.utils.loader.hide();// hide loader
	}else{// unknown error
		alert('Sorry, shit happens.');
		whoWhere.utils.loader.hide();// hide loader
	};
}
whoWhere.editLocation.locationPhotoEdit = function(){
	// delete
	$(".reset-location-photo").unbind("click.locationPhotoEdit").bind("click.locationPhotoEdit", function(e){
		e.preventDefault();
		var $this = $(this);
		var $img = $('.map').removeAttr('style').removeAttr('data-background');
		if(whoWhere.utils){
			whoWhere.utils.setPageMinWidth();// RESET MIN WIDTH TO PAGE
		}
	});
	// upload
	$(".change-location-photo").unbind("click.locationPhotoEdit").bind("click.locationPhotoEdit", function(e){
		e.preventDefault();
		var $this = $(this);
		var uploadForm = $this.siblings('.photo-upload-form-location');
		var uploadFormInput = uploadForm.find('.photo-upload-input-location');
		uploadFormInput.unbind('change.locationPhotoEdit').bind('change.locationPhotoEdit',function(){
			uploadForm.trigger('submit');
		});
		uploadFormInput.trigger('click');
	});
	// upload loader bind on form submit
	$(".photo-upload-form-location").unbind("submit.locationPhotoEdit").bind("submit.locationPhotoEdit", function(e){
		var $this = $(this);
		var errorClass = 'validate-error';
		var $fileInput = $this.find('.photo-upload-input-location');
		if(!$fileInput.val().length || $fileInput.val().length<4){
			$fileInput.addClass(errorClass);
			e.preventDefault();
		}else{
			$fileInput.removeClass(errorClass);
			whoWhere.utils.loader.show();// show loader
			var $currentLocation = $('.map');
			whoWhere.editLocation.currentEditLocation = $currentLocation;
		}
	});
}
/* END LOCATION PHOTO EDIT LIGHT */
/* BEGIN UTILS */
whoWhere.editLocation.getDeleteLightBox = function(params){
	var $dialogWrapper = params.$dialogEl;
	var $dialogInner = $dialogWrapper.find('.delete-inner');
	var $dialogClone = $dialogInner.clone();
	$dialogWrapper.data('popup',$dialogClone);
	$dialogWrapper.data('popup').dialog( "destroy" );
	$dialogWrapper.data('popup').find('.text').html(params.dialogText);// set text
	$dialogWrapper.data('popup').dialog({
		resizable: false,
		modal: true,
		autoOpen:true,
		title:'Подтверждение удаления',
		create: function(event, ui) {
			var _dialogWindow = $(this).parent();
			/* ARROW events when dialog is open */
			$(document).unbind('keydown.dialog').bind('keydown.dialog', function(event){ // init moving focus in dialog window
				if(event.keyCode==37 || event.keyCode==40){ // left+bottom arrow
					_dialogWindow.find('button').eq(0).trigger('focus'); // OK button
					return false;
				}else if(event.keyCode==39){ // right arrow
					_dialogWindow.find('button').eq(1).trigger('focus'); // CANCEL button
					return false;
				}else if(event.keyCode==38){ // up arrow
					_dialogWindow.find('.ui-dialog-titlebar-close').trigger('focus'); // CLOSE button
					return false;
				}
			});
			$(document).unbind("click.dialog").bind("click.dialog", function(e){
				whoWhere.utils.faderClick(e,$dialogWrapper);
			}); // bind hide dialog by fader click
		},
		beforeClose: function(event, ui) {
			$(document).unbind('keydown.dialog'); // unbind moving focus in dialog window
			$(document).unbind("click.dialog"); // unbind hide dialog by fader click
			$dialogClone.remove();
		},
		buttons: {
			"Удалить": function() {
				params.callback();
				$(this).dialog( "close" );
			},
			'Отмена': function() {
				$(this).dialog( "close" );
			}
		}
	});
}
/* END UTILS */
})(jQuery);// end jQuery closure