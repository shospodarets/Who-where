/**
 * Who-where - JavaScipt- application
 * Copyright (c) 2011-2015 Serg Gospodarets ( https://gospodarets.com/ | sgospodarets@gmail.com )
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
// REQUIREDS:
// OTHER: -
// THIS:  whoWhere.sortDrag whoWhere.utils
(function($){// start jQuery closure
$(document).unbind('ready.whoWhere.addItems').bind('ready.whoWhere.addItems',function(){// document ready
	whoWhere.addItems.init();
});
if(!window.whoWhere){
	window.whoWhere = {};
}
whoWhere.addItems = {};
whoWhere.addItems.init = function(){// INIT
	whoWhere.addItems.addTeams();
	whoWhere.addItems.addItem();
}
/* START ADD TEAMS */
whoWhere.addItems.addTeams = function(){
	var sideWrapper = $('.people');
	sideWrapper.undelegate(".add-new-team a","click.addTeams").delegate(".add-new-team a", "click.addTeams", function(e){
		e.preventDefault();
		var $this = $(this);
		var editStringDialogWrapper = $('.examples-wrapper .edit-string-dialog-wrapper');
		whoWhere.utils.getStringEditableDialog(editStringDialogWrapper,editStringDialogWrapper.find('.edit-string-dialog'),'','Название новой команды/отдела')
		editStringDialogWrapper.unbind('getStringEditableDialog.save').bind('getStringEditableDialog.save',function(trigger){
			var column = $this.closest('.column');
			var $teamExample = $('.examples-wrapper .team').clone();
			$teamExample.find('.team-name').html(trigger.eventData);
			column.append($teamExample);
		});
	});
}
/* END ADD TEAMS */
/* START ADD ITEMS */
whoWhere.addItems.addItem = function(){
	var sideWrapper = $('.people');
	sideWrapper.undelegate(".team-name-wrapper .add","click.addItems").delegate(".team-name-wrapper .add", "click.addItems", function(e){
		e.preventDefault();
		var $this = $(this);
		var validFlag = 0;
		var $subteam = $this.closest('.team').find('.subteam');
		var $centerRowsWrapper = $('.map .view-content');
		// create new els
		var $newSideRow = $('.examples-wrapper .worker-example .worker').clone();
		var $newCenterRow = $('.examples-wrapper .views-row-example .views-row').clone();
		// set temp basic email
		var tempEmail = 'temp@temp.com';
		$newSideRow.find('.title').attr('href','mailto:'+tempEmail).attr('data-mail',tempEmail);
		$newCenterRow.find('.point').attr('href','mailto:'+tempEmail).attr('data-mail',tempEmail);
		// append
		$newSideRow.appendTo($subteam).hide();
		$newCenterRow.appendTo($centerRowsWrapper).hide();
		// trigger edit dialog
		var $userLightBox = $newCenterRow.find('.user-lightbox');
		var $dialogWrapper = $('.examples-wrapper .user-lightbox-example');
		var $dialogInner = $dialogWrapper.find('.user-lightbox');
		whoWhere.utils.getDataEditableDialog({// data editable light
			$dialogWrapper: $dialogWrapper,
			$dialogInner: $dialogInner,
			dialogTitleText: '',
			$userLightBox: $userLightBox,
			beforeCloseCallback: function(){
				if(!validFlag){
					$newSideRow.remove();
					$newCenterRow.remove();
				}
			},
			validationSuccessCallback: function(){
				validFlag = 1;
				$newSideRow.show();
				$newCenterRow.show();
				if(whoWhere.sortDrag){
					whoWhere.sortDrag.initSortable();
				}
			},
			addItemDialog:1// for set inner view
		});
		
	});
}
/* END ADD ITEMS */
})(jQuery);// end jQuery closure