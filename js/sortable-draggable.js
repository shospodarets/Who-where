/**
 * Who-where - JavaScipt- application
 * Copyright (c) 2011-2012 Sergey Gospodarets ( http://gospodarets.com/ | sgospodarets@gmail.com )
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
// REQUIREDS:
// OTHER: whoWhere.addItems , whoWhere.editItems , whoWhere.JSONToUsers
// THIS:  -
(function($){// start jQuery closure
$(document).unbind('ready.whoWhere.sortDrag').bind('ready.whoWhere.sortDrag',function(){// document ready
	whoWhere.sortDrag.init();
});
if(!window.whoWhere){
	window.whoWhere = {};
}
whoWhere.sortDrag = {};
whoWhere.sortDrag.init = function(){// INIT
	whoWhere.sortDrag.initSortable();
	whoWhere.sortDrag.initDraggable();
}
whoWhere.sortDrag.initSortable = function(){
	//vars
	var zIndexClass = 'z-index';
	var noActionClass = 'no-action';
	var hoverClass = 'hover';
	/* SORT FOR TEAM IN COLUMNS */
	$('.column').sortable('destroy').sortable({
		connectWith:$('.column'),
		items: '.team',
		containment: $('.people'),
		placeholder: "ui-state-highlight",
		start: function(e,ui){
			$('.map .employee').addClass(noActionClass);// set no action for popups
			ui.item.closest('.column').addClass(zIndexClass);// set z-index
			ui.item.closest('.team').addClass(zIndexClass);
			ui.placeholder.css({ // set placeholder size
				'width':ui.item.width(),
				'height':ui.item.height()
			});
		},
		change: function(e,ui){
			$('.column').removeClass(zIndexClass);// reset z-index
			$('.team').removeClass(zIndexClass);
			ui.item.closest('.column').addClass(zIndexClass);// set z-index
			ui.item.closest('.team').addClass(zIndexClass);
		},
		stop:function(e,ui){
			$('.map .employee').removeClass(noActionClass);// reset no action for popups
			$('.column').removeClass(zIndexClass);// reset z-index
			ui.item.closest('.team').removeClass(zIndexClass);
		}
	}).disableSelection();
	/* SORT FOR WORKERS IN TEAMS */
	$('.subteam').sortable('destroy').sortable({
		connectWith:$('.subteam'),
		items: '.worker',
		containment: $('.people'),
		placeholder: "ui-state-highlight",
		start: function(e,ui){
			ui.item.addClass(hoverClass);// hover class
			$('.map .employee').addClass(noActionClass);// set no action for popups
			ui.item.closest('.column').addClass(zIndexClass);// set z-index
			ui.item.closest('.team').addClass(zIndexClass);
			ui.placeholder.css({ // set placeholder size
				'width':ui.item.width(),
				'height':ui.item.height()
			});
		},
		change: function(e,ui){
			$('.column').removeClass(zIndexClass);// reset z-index
			$('.team').removeClass(zIndexClass);
			ui.item.closest('.column').addClass(zIndexClass);// set z-index
			ui.item.closest('.team').addClass(zIndexClass);
		},
		stop:function(e,ui){
			ui.item.removeClass(hoverClass);// hover class
			$('.map .employee').removeClass(noActionClass);// reset no action for popups
			$('.column').removeClass(zIndexClass);// reset z-index
			ui.item.closest('.team').removeClass(zIndexClass);
		}
	}).disableSelection();
}
whoWhere.sortDrag.sortableDisable = function(){
	$('.subteam').sortable('disable');
	$('.column').sortable('disable');
}
whoWhere.sortDrag.sortableEnable = function(){
	$('.subteam').sortable('enable');
	$('.column').sortable('enable');
}
whoWhere.sortDrag.initDraggable = function(){
	var noActionClass = 'no-action';
	var _parent = $('.map');
	$( ".employee" ).liveDraggable({
		containment: _parent,
		start: function(e,ui){
			$(this).addClass(noActionClass);
		},
		stop:function(e,ui){
			var $this = $(this);
			$this.removeClass(noActionClass);
			// reposition drop on sortable end if row is in hover
			var $row = $this.closest('.views-row');
			if($row.hasClass('active-view')){
				var $holder = $this.find('.holder');
				$holder.trigger('custom.showDrop');
			}
		}
	});
}

/* BEGIN UTILS */
$.fn.liveDraggable = function (opts) {
	this.each(function(){
		$(this).draggable(opts);
	});
	this.live("mouseover", function() {
		if (!$(this).data("draggable")) {
			$(this).draggable(opts);
		}
	});
};
/* END UTILS */
})(jQuery);// end jQuery closure