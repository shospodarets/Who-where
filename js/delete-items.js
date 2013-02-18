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
// THIS:  -
(function($){// start jQuery closure
$(document).unbind('ready.whoWhere.deleteItems').bind('ready.whoWhere.deleteItems',function(){// document ready
	whoWhere.deleteItems.init();
});
if(!window.whoWhere){
	window.whoWhere = {};
}
whoWhere.deleteItems = {};
whoWhere.deleteItems.init = function(){// INIT
	whoWhere.deleteItems.deleteUsers();
	whoWhere.deleteItems.deleteTeams();
}
whoWhere.deleteItems.deleteUsers = function(){
	var userSideWrapper = $('.people');
	userSideWrapper.undelegate(".worker .remove","click.deleteUsers").delegate(".worker .remove", "click.deleteUsers", function(e) {
		e.preventDefault();
		var $this = $(this);
		var $worker = $this.closest('.worker');
		var userOnSide = $worker.find('.title');
		var userOnMap = $('a.point[href="'+userOnSide.attr('href')+'"]');
		whoWhere.deleteItems.getDeleteLightBox({
			$dialogEl:$('.delete-item-dialog'),
			dialogText:$.trim(userOnSide.text()),
			callback:function(){
				userOnMap.remove();
				$worker.remove();
			}
		});
	});
}
whoWhere.deleteItems.deleteTeams = function(){
	var userSideWrapper = $('.people');
	userSideWrapper.undelegate(".team-name-wrapper .remove","click.deleteTeams").delegate(".team-name-wrapper .remove", "click.deleteTeams", function(e) {
		e.preventDefault();
		var $this = $(this);
		var $team = $this.closest('.team');
		var $teamName = $team.find('.team-name');
		whoWhere.deleteItems.getDeleteLightBox({
			$dialogEl:$('.delete-team-dialog'),
			dialogText:$.trim($teamName.text()),
			callback:function(){
				$team.find('.worker .title').each(function(){
					var userOnSide = $(this);
					var userOnMap = $('a.point[href="'+userOnSide.attr('href')+'"]');
					userOnMap.remove();
				});
				$team.remove();
			}
		})
	});
}
/* BEGIN UTILS */
whoWhere.deleteItems.getDeleteLightBox = function(params){
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