/**
 * Who-where - JavaScipt- application
 * Copyright (c) 2011-2012 Sergey Gospodarets ( http://gospodarets.com/ | sgospodarets@gmail.com )
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
// REQUIREDS:
// OTHER: whoWhere.utils require in this (if user is editor)
// THIS:  whoWhere.sortDrag
(function($){// start jQuery closure
$(document).bind('ready.whoWhere.editItems').bind('ready.whoWhere.editItems',function(){// document ready
	whoWhere.editItems.init();
});
if(!window.whoWhere){
	window.whoWhere = {};
}
whoWhere.editItems = {};
whoWhere.editItems.init = function(){// INIT
	whoWhere.editItems.optionsPopup();
	whoWhere.editItems.teamName();
	whoWhere.editItems.editItem();
	whoWhere.editItems.editItem.lightBoxAddRemoveButtons();
	whoWhere.editItems.editItem.lightBoxPhotoEdit();
	whoWhere.editItems.editItem.switchToDialog();
}
/* START POPUP */
whoWhere.editItems.optionsPopup = function(){
	var zIndexClass = 'z-index';
	var sideWrapper = $('.people');
	var leftClass = 'to-left';// to left
	var topClass = 'to-top';// to top
	var $pageWrapper = $('#wrapper');
	// popups alignment
	sideWrapper.undelegate(".options-wrapper","mouseenter.optionsPopup").delegate(".options-wrapper", "mouseenter.optionsPopup", function(e){
		if(whoWhere.sortDrag){
			whoWhere.sortDrag.sortableDisable();
		}
		var $wrapper = $(this);
		var $column = $wrapper.closest('.column');
		$column.addClass(zIndexClass);// set z-index
		var $popup = $wrapper.find('.options-popup');
		whoWhere.utils.setLeftTopClasses($pageWrapper,sideWrapper,$popup,leftClass,topClass);
		var userLink = $wrapper.closest('.worker').find('.title'); // set checkboxes states
		$popup.find('.checkbox').each(function(){
			var $this = $(this);
			if(userLink.hasClass($this.attr('value'))){
				$this.prop("checked", true);
			}else{
				$this.prop("checked", false);
			}
		});
	}).undelegate(".options-wrapper","mouseleave.optionsPopup").delegate(".options-wrapper", "mouseleave.optionsPopup", function(e){
		if(whoWhere.sortDrag){
			whoWhere.sortDrag.sortableEnable();
		}
		var $wrapper = $(this);
		var $column = $wrapper.closest('.column');
		$column.removeClass(zIndexClass);// set z-index
		var $popup = $wrapper.find('.options-popup');
		$popup.removeClass(leftClass);
		$popup.removeClass(topClass);
	});
	// popups checkbox change
	sideWrapper.undelegate(".options-popup .checkbox","change.optionsPopup").delegate(".options-popup .checkbox", "change.optionsPopup", function(e){
		var $checkbox = $(this);
		var $userWrapper = $checkbox.closest('.worker');
		var $user = $userWrapper.find('.title');
		var $centerLink = $('a.point[href="'+$user.attr('href')+'"]');
		if($checkbox.is(':checked')){
			$user.addClass($checkbox.attr('value'));
			$centerLink.addClass($checkbox.attr('value'));
		}else{
			$user.removeClass($checkbox.attr('value'));
			$centerLink.removeClass($checkbox.attr('value'));
		}
	});
}
/* END POPUP */
/* START EDIT TEAMNAME */
whoWhere.editItems.teamName = function(){
	var sideWrapper = $('.people');
	sideWrapper.undelegate(".team-name-wrapper .options","click.teamName").delegate(".team-name-wrapper .options", "click.teamName", function(e){
		e.preventDefault();
		var $this = $(this);
		var $teamName = $this.closest('.team-name-wrapper').find('.team-name');
		var editStringDialogWrapper = $('.examples-wrapper .edit-string-dialog-wrapper');
		whoWhere.utils.getStringEditableDialog(editStringDialogWrapper,editStringDialogWrapper.find('.edit-string-dialog'),$teamName.text(), 'Редактирование названия команды/отдела')
		editStringDialogWrapper.unbind('getStringEditableDialog.save').bind('getStringEditableDialog.save',function(trigger){
			$teamName.html(trigger.eventData);
		});
	});
}
/* END EDIT TEAMNAME */
/* START EDIT ITEM */
whoWhere.editItems.editItem = function(){
	var sideWrapper = $('.people');
	sideWrapper.undelegate(".worker .options","click.editItem").delegate(".worker .options", "click.editItem", function(e){
		e.preventDefault();
		var $this = $(this);
		var link = $this.closest('.worker').find('.title');
		var target = $('a.point[href="'+link.attr('href')+'"]');
		var $targetTrigger = target.closest('.holder');
		target.trigger('editDialog.userInfoDialog');// show user edit dialog
	});
	var $userMapWrapper = $('.map');
	$userMapWrapper.undelegate(".holder","dblclick.editItem").delegate(".holder", "dblclick.editItem", function(e){
		e.preventDefault();
		var $this = $(this);
		$this.trigger('editDialog.userInfoDialog');// show user edit dialog
	}).undelegate(".holder","editDialog.userInfoDialog").delegate(".holder", "editDialog.userInfoDialog", function(e){
		e.preventDefault();
		var $this = $(this);
		var $userLightBox = $this.find('.user-lightbox');
		var $dialogWrapper = $('.examples-wrapper .user-lightbox-example');
		var $dialogInner = $dialogWrapper.find('.user-lightbox');
		whoWhere.utils.getDataEditableDialog({// data editable light
			$dialogWrapper: $dialogWrapper,
			$dialogInner: $dialogInner,
			dialogTitleText: '',
			$userLightBox: $userLightBox
		});
	});
}
/* END EDIT ITEM */
/* START LIGHTBOX ADD/REMOVE FIELDS BUTTONS */
whoWhere.editItems.editItem.lightBoxAddRemoveButtons = function(){
	// ADD
	$(document).undelegate(".user-lightbox .add-info-btn","click.lightBoxAddRemoveButtons").delegate(".user-lightbox .add-info-btn", "click.lightBoxAddRemoveButtons", function(e){
		e.preventDefault();
		var $this = $(this);
		var $addBtnWrapper =$this.closest('.add-info');
		var $addInfoHolder = $this.closest('.add-info-holder');
		var $addInfoWrapperReal = $addInfoHolder.find('.add-info-wrapper:hidden').eq(0);
		var $addInfoWrapperToClone = $addInfoWrapperReal.clone().show();
		$addInfoWrapperToClone.insertAfter($addInfoWrapperReal);// insert as first field after hidden infoWrapper
		//add focus
		var $firstVisibleInput = $addInfoHolder.find('input:visible').eq(0);
		if($firstVisibleInput.hasClass('value')){// fix for value/name inputs
			$firstVisibleInput.siblings('.name').focus();
		}else{
			$firstVisibleInput.focus();
		}
		// one fields box -> hide add btn
		if(!$addInfoHolder.hasClass('multi')){
			$this.closest('.add-info').hide();
		}
	});
	// REMOVE
	$(document).undelegate(".user-lightbox .remove-info-btn","click.lightBoxAddRemoveButtons").delegate(".user-lightbox .remove-info-btn", "click.lightBoxAddRemoveButtons", function(e){
		e.preventDefault();
		var $this = $(this);
		var $addInfoHolder = $this.closest('.add-info-holder');
		var $addInfoWrapperToRemove = $this.closest('.add-info-wrapper');
		var $addBtnWrapper = $addInfoHolder.find('.add-info');
		$addInfoWrapperToRemove.remove();
		$addBtnWrapper.show();
	});
}
/* END LIGHTBOX ADD/REMOVE FIELDS BUTTONS */
/* START LIGHTBOX PHOTO EDIT */
whoWhere.editItems.currentEditImages = $([]);
whoWhere.editItems.uploadCallback = function(response){// upload callback processing
	whoWhere.utils.log(response);
	var $response = $($.parseXML(response));
	if($response.find('original_image').length){// picture published
		var responseImg = $('<img />');
		responseImg.unbind('load.uploadCallback').bind('load.uploadCallback',function(){
			whoWhere.editItems.currentEditImages.attr('src',responseImg.attr('src'));
			whoWhere.utils.loader.hide();// hide loader
			whoWhere.editItems.currentEditImages = $([]);// clean current image after operation
		}).unbind('error.uploadCallback').bind('error.uploadCallback',function(){
			alert('Image is broken or not an image');
			whoWhere.utils.loader.hide();// hide loader
		}).unbind('abort.uploadCallback').bind('abort.uploadCallback',function(){
			alert('Image load is abort');
			whoWhere.utils.loader.hide();// hide loader
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
whoWhere.editItems.editItem.lightBoxPhotoEdit = function(){
	// delete
	$(document).undelegate(".photo-delete", "click.lightBoxPhotoEdit").delegate(".photo-delete", "click.lightBoxPhotoEdit", function(e){
		e.preventDefault();
		var $this = $(this);
		var $img = $this.closest('.image-wrapper').find('.user-image');
		$img.attr('src',$this.attr('href'));
	});
	// upload
	$(document).undelegate(".photo-upload", "click.lightBoxPhotoEdit").delegate(".photo-upload", "click.lightBoxPhotoEdit", function(e){
		e.preventDefault();
		var $this = $(this);
		var uploadForm = $this.siblings('.photo-upload-form');
		var uploadFormInput = uploadForm.find('.photo-upload-input');
		uploadFormInput.unbind('change.lightBoxPhotoEdit').bind('change.lightBoxPhotoEdit',function(){
			uploadForm.trigger('submit');
		});
		uploadFormInput.trigger('click');
	});
	// upload loader bind on form submit
	$(document).undelegate(".photo-upload-form", "submit.lightBoxPhotoEdit").delegate(".photo-upload-form", "submit.lightBoxPhotoEdit", function(e){
		var $this = $(this);
		var errorClass = 'validate-error';
		var $fileInput = $this.find('.photo-upload-input');
		if(!$fileInput.val().length || $fileInput.val().length<4){
			$fileInput.addClass(errorClass);
			e.preventDefault();
		}else{
			$fileInput.removeClass(errorClass);
			whoWhere.utils.loader.show();// show loader
			var $lightUserImage = $this.closest('.image-wrapper').find('.user-image');
			whoWhere.editItems.currentEditImages = $lightUserImage;
		}
	});
}
/* END LIGHTBOX PHOTO EDIT LIGHT */
/* START SWITCH TO LIGHT */
whoWhere.editItems.editItem.switchToDialog = function(){
	// to edit
	$(document).undelegate(".swich-to-edit", "click.switchToEditDialog").delegate(".swich-to-edit", "click.switchToEditDialog", function(e){
		e.preventDefault();
		var $this = $(this);
		var $dialog = $this.closest('.ui-dialog-content');
		var userMail = 'mailto:' + $.trim( $dialog.find('.user-basic-mail').text() );
		var $centerLink = $('.map .point[href="'+userMail+'"]');
		var $centerHolder = $centerLink.closest('.holder');
		var dialog = $dialog.data('dialog');
		if(dialog){
			dialog.close();
			$centerHolder.trigger('editDialog.userInfoDialog');// show user edit dialog
		}
	});
	// to view
	$(document).undelegate(".swich-to-view", "click.switchToViewDialog").delegate(".swich-to-view", "click.switchToViewDialog", function(e){
		e.preventDefault();
		var $this = $(this);
		var $dialog = $this.closest('.ui-dialog-content');
		var userMail = 'mailto:' + $.trim( $dialog.find('.user-basic-mail input:visible').attr('data-email-before-edit') );
		var $centerLink = $('.map .point[href="'+userMail+'"]');
		var $centerHolder = $centerLink.closest('.holder');
		var dialog = $dialog.data('dialog');
		if(dialog){
			$dialog.closest('.ui-dialog').find('.ui-button-text:contains("Сохранить")').closest('.ui-button').trigger('click');
			// check validation
			var errorClass = 'validate-error';
			if(!$dialog.find('.'+errorClass).length){
				$centerHolder.trigger('showDialog.userInfoDialog');// show user view dialog
			}
		}
	});
}
/* END SWITCH TO LIGHT */
/* BEGIN UTILS */
/* START FOR USER LIGHT FROM EDIT LIGHT */
whoWhere.editItems.editItem.fromElsLightToMultiElsUser = function($from,$to,appendElTagName){
	var $hiddenTrigger = $to.closest('.hidden-trigger');
	if($from.length){
		$hiddenTrigger.removeClass('hidden');
		var $clone = $to.find(appendElTagName).eq(0).clone();
		$clone.find('.name').text('');
		$clone.find('.value').text('');
		$to.find(appendElTagName).remove();
		$from.each(function(){
			var $this = $(this);
			var name = whoWhere.utils.simpleEncode( $this.val() );
			var value = whoWhere.utils.simpleEncode( $this.siblings('.value').val() );
			var $secondClone = $clone.clone();
			$secondClone.find('.name').html(name);
			$secondClone.find('.value').html(value);
			$to.append($secondClone);
		});
		$clone.remove();
	}else{
		$hiddenTrigger.addClass('hidden');
		$to.find(appendElTagName).each(function(i){
			var $this = $(this);
			$this.find('.name').text('');
			$this.find('.value').text('');
			if(i){
				$this.remove();
			}
		});
	}
}
whoWhere.editItems.editItem.fromElsLightToElsUser = function($from,$to,appendElTagName){
	var $hiddenTrigger = $to.closest('.hidden-trigger');
	if($from.length){
		$hiddenTrigger.removeClass('hidden');
		var value = whoWhere.utils.simpleEncode( $from.val() );
		var $clone = $to.find(appendElTagName).eq(0).clone().text('');
		$to.find(appendElTagName).remove();
		$from.each(function(){
			var $this = $(this);
			var $secondClone = $clone.clone().text( whoWhere.utils.simpleEncode( $this.val() ) );
			$to.append($secondClone);
		});
		$clone.remove();
	}else{
		$hiddenTrigger.addClass('hidden');
		$to.find(appendElTagName).each(function(i){
			var $this = $(this);
			$this.text('');
			if(i){
				$this.remove();
			}
		});
	}
}
whoWhere.editItems.editItem.fromElLightToElUser = function($from,$to){
	if($from.length){
		var value = whoWhere.utils.simpleEncode( $from.val() );
	}else{
		var value = '';
	}
	var $hiddenTrigger = $to.closest('.hidden-trigger');
	if(value.length){
		$hiddenTrigger.removeClass('hidden');
		$to.text( value );
	}else{
		$hiddenTrigger.addClass('hidden');
		$to.text('');
	}
}
/* END FOR USER LIGHT FROM EDIT LIGHT */
/* START FOR EDIT LIGHT FROM USER LIGHT */
whoWhere.editItems.editItem.fromElsUserToMultiElsLight = function($from,$to,$cloneBox,attr){
	$from.each(function(i){
		var fromObj = $(this);
		var fromName = fromObj.siblings('.name');
		if( fromName.length && $.trim(fromObj.text()).length && $.trim(fromName.text()).length ){
			var $addInfo = $cloneBox.clone().show();
			$to.append($addInfo);
			$addInfo.find('.value')[attr]($.trim(fromObj.text()));
			$addInfo.find('.name')[attr]($.trim(fromName.text()));
		}
	});
}
whoWhere.editItems.editItem.fromElsUserToElsLight = function($from,$to,$cloneBox,attr){
	$from.each(function(i){
		var fromObj = $(this);
		if( $.trim(fromObj.text()).length ){
			var $addInfo = $cloneBox.clone().show();
			$to.append($addInfo);
			$addInfo.find('input')[attr]($.trim(fromObj.text()));
		}
	});
}
whoWhere.editItems.editItem.fromElUserToElLight = function($from,$to,$cloneBox,attr){
	if( $.trim($from.text()).length ){
		var $addInfo = $cloneBox.clone().show();
		$to.append($addInfo);
		$addInfo.find('input')[attr]($.trim($from.text()));
	}
}
/* END FOR EDIT LIGHT FROM USER LIGHT */
/* START SYNC DATA */
whoWhere.editItems.editItem.syncLightDataFromUser = function($lightFrom,$lightTo){// EDIT LIGHT FROM USER LIGHT // appends go to '.add-info-holder'
	$lightTo.find('.user-name input').val($.trim( $lightFrom.find('.user-name').text() ));// name
	$lightTo.find('.user-position-name input').val($.trim( $lightFrom.find('.user-position-name').text() ));// position
	// basic mail
	var basicMail = $.trim( $lightFrom.find('.user-basic-mail').text() );
	$lightTo.find('.user-basic-mail input').val(basicMail).attr('data-email-before-edit',basicMail);
	// src
	var srcValue = $lightFrom.find('.user-image').attr('src');
	$lightTo.find('.user-image').attr('src',srcValue);
	// user login
	whoWhere.editItems.editItem.fromElUserToElLight($lightFrom.find('.user-login'),$lightTo.find('.user-login .add-info-holder'),$lightTo.find('.user-login .add-info-wrapper'),'val');
	// user phones
	whoWhere.editItems.editItem.fromElsUserToElsLight($lightFrom.find('.phones span'),$lightTo.find('.phones .add-info-holder'),$lightTo.find('.phones  .add-info-wrapper'),'val');
	// user mails
	whoWhere.editItems.editItem.fromElsUserToElsLight($lightFrom.find('.mails span'),$lightTo.find('.mails .add-info-holder'),$lightTo.find('.mails  .add-info-wrapper'),'val');
	// users messengers
	whoWhere.editItems.editItem.fromElsUserToMultiElsLight($lightFrom.find('.messengers span .value'),$lightTo.find('.messengers .add-info-holder'),$lightTo.find('.messengers .add-info-wrapper'),'val');
	$lightTo.find('.add-info-holder').each(function(){// check not multicontainer to hide "plus" button
		var $addInfoHolder = $(this);
		var $addInfoWrapperVisible = $addInfoHolder.find('.add-info-wrapper:visible');
		if(!$addInfoHolder.hasClass('multi') && $addInfoWrapperVisible.length){
			var $addBtnWrapper = $addInfoHolder.find('.add-info');
			$addBtnWrapper.hide();
		}
	});
}
whoWhere.editItems.editItem.syncUserDataFromLight = function($lightFrom,$lightTo){// USER LIGHT FROM EDIT LIGHT
	var $centerRow = $lightTo.closest('.views-row');
	var $centerLink = $centerRow.find('.point');
	var $sideLink = $('.people .worker .title[href="'+$centerLink.attr('href')+'"]');
	// name
	var nameValue = whoWhere.utils.simpleEncode( $lightFrom.find('.user-name input').val() );
	$centerRow.find('.user-name').html(nameValue);
	$sideLink.html(nameValue);
	// src
	var srcValue = $lightFrom.find('.user-image').attr('src');
	$centerRow.find('.user-image').attr('src',srcValue);
	// position
	var positionValue = whoWhere.utils.simpleEncode( $lightFrom.find('.user-position-name input').val() );
	$centerRow.find('.user-position-name').html(positionValue);
	// basic mail
	var mailValue = whoWhere.utils.simpleEncode( $lightFrom.find('.user-basic-mail input').val() );
	$centerRow.find('.user-basic-mail').html(mailValue);
	$centerLink.attr('data-mail',mailValue).attr('href','mailto:'+mailValue);
	$sideLink.attr('data-mail',mailValue).attr('href','mailto:'+mailValue);
	// user login
	whoWhere.editItems.editItem.fromElLightToElUser($lightFrom.find('.user-login input:visible'),$centerRow.find('.user-login'));
	// user phones
	whoWhere.editItems.editItem.fromElsLightToElsUser($lightFrom.find('.phones input:visible'),$centerRow.find('.phones'),'span');
	// user mails
	whoWhere.editItems.editItem.fromElsLightToElsUser($lightFrom.find('.mails input:visible'),$centerRow.find('.mails'),'span');
	// user messengers
	whoWhere.editItems.editItem.fromElsLightToMultiElsUser($lightFrom.find('.messengers input.name:visible'),$centerRow.find('.messengers'),'span')
	// TO DO NEED TO HIDE ADD SECTION IF SHE IS EMPTY !!!
}
/* END SYNC DATA */
/* END UTILS */
})(jQuery);// end jQuery closure