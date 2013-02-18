/**
 * Who-where - JavaScipt- application
 * Copyright (c) 2011-2012 Sergey Gospodarets ( http://gospodarets.com/ | sgospodarets@gmail.com )
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
// REQUIREDS:
// OTHER: whoWhere.editLocation
// THIS:  whoWhere.sortDrag , whoWhere.usersToJSON, whoWhere.utils
(function($){// start jQuery closure
$(document).unbind('ready.whoWhere.JSONToUsers').bind('ready.whoWhere.JSONToUsers',function(){// document ready
	whoWhere.JSONToUsers.init();
});
if(!window.whoWhere){
	window.whoWhere = {};
}
whoWhere.JSONToUsers = {}
whoWhere.JSONToUsers.init = function(){// INIT
	whoWhere.JSONToUsers.switchers();
	whoWhere.JSONToUsers.run();
	$('.donwload-upload-btns .upload-from-server').unbind('click.fromJson').bind('click.fromJson',function(e){
		e.preventDefault();
		whoWhere.JSONToUsers.run();
	});
}
whoWhere.JSONToUsers.switchers = function(){
	var $switchersWrapper = $('.locations-list');
    var activeClass = 'active';
	$switchersWrapper.undelegate("li","click.JSONToUsers").delegate("li", "click.JSONToUsers", function(e){
		e.preventDefault();
		var $this = $(this);
		if(!$this.hasClass(activeClass)){
			whoWhere.utils.URIHash.remove('userInfoPopup');
			whoWhere.utils.URIHash.remove('userInfoDialog');
			whoWhere.utils.URIHash.set('location-postfix',$this.attr('data-location'));
			$switchersWrapper.find('li').removeClass(activeClass);
			$this.addClass(activeClass);
			whoWhere.JSONToUsers.run();
		}
	});
}
/* begin json-to-users */
/* START TRY TO GET LAST WORKED DATA */
whoWhere.JSONToUsers.cleanContent = function(){
	$( ".employee" ).draggable( "destroy" );// destroy draggable to prevent memory leaks
	$('.map .view-content').empty();
	$('.people .team').remove();
	$('.map').removeAttr('style').removeAttr('data-background');// clear map background and dimensions
}
whoWhere.JSONToUsers.uploadLastWorkedVersion = function(){
	var lastWorkedUrl = 'inc/locations/last-worked-location-'+$('.locations-list .active').eq(0).attr('data-location')+'.json';
	var request = $.ajax({
		url:lastWorkedUrl,
		type: "POST",
		success: function(data){
			if(typeof(data)!='object'){// parse data if need
				var obj = $.parseJSON(data);
			}else{
				var obj = data;
			}
			if(obj){
				whoWhere.JSONToUsers.cleanContent();
				whoWhere.JSONToUsers.parse(obj);
				whoWhere.utils.loader.hide();// hide loader
			}else{
				alert('json-данные, загруженные по адресу: "'+lastWorkedUrl+'"'+' имеют неверный формат');
				whoWhere.utils.loader.hide();// hide loader
			}
		},
		error: function(err){
			alert('Ошибка при попытке получить json-данные по адресу: "'+lastWorkedUrl+'"');
			whoWhere.utils.loader.hide();// hide loader
		}
	});
}
/* END TRY TO GET LAST WORKED DATA */
whoWhere.JSONToUsers.run = function(){
	whoWhere.JSONToUsers.beforeRun();
	if(!$('.locations-list .active').length){
		whoWhere.JSONToUsers.getLocations();
	}else{
		whoWhere.JSONToUsers.getActiveLocationContent();
	}
}
whoWhere.JSONToUsers.setFirstLocations = function(){// set first location if isn't active locations
	var $locationList = $('.locations-list');
	var activeClass = 'active';
	if (!$locationList.find('.' + activeClass).length) {
		var $switcher = $('.location-switcher-example li').clone();
		var locationPostfix = 'firstlocation';
		var locationText = 'Первая локация';
		$switcher.attr({
			'data-location':locationPostfix,
			'title':'Постфикс в имени файла с данными- "'+locationPostfix+'"'
		});
		$switcher.find('.text').html(whoWhere.utils.decode(locationText));
		$switcher.addClass(activeClass);
		$locationList.append($switcher);
	}
}
whoWhere.JSONToUsers.getLocations = function(){
	var url = 'inc/locations/locations-list.json';
	var request = $.ajax({
		url:url,
		type: "POST",
		success: function(data){
			if(typeof(data)!='object'){// parse data if need
				var obj = $.parseJSON(data);
			}else{
				var obj = data;
			}
			if(obj){
				whoWhere.JSONToUsers.locationParse(obj);
				whoWhere.JSONToUsers.getActiveLocationContent(true);
			}else{
				alert('json-данные локаций, загруженные по адресу: "'+url+'"'+' имеют неверный формат');
				whoWhere.JSONToUsers.setFirstLocations();// set first location on error
				whoWhere.utils.loader.hide();// hide loader
			}
		},
		error: function(err){
			alert('Ошибка при попытке получить json-данные локаций по адресу: "'+url+'"');
			whoWhere.JSONToUsers.setFirstLocations();// set first location on error
			whoWhere.utils.loader.hide();// hide loader
		}
	});
}
whoWhere.JSONToUsers.getActiveLocationContent = function(afterGetLocations){
	afterGetLocations = afterGetLocations || false;
	var url = 'inc/locations/who-where-location-'+$('.locations-list .active').eq(0).attr('data-location')+'.json';
	var request = $.ajax({
		url:url,
		type: "POST",
		success: function(data){
			if(typeof(data)!='object'){// parse data if need
				var obj = $.parseJSON(data);
			}else{
				var obj = data;
			}
			if(obj){
				whoWhere.JSONToUsers.cleanContent();
				whoWhere.JSONToUsers.parse(obj);
				if(afterGetLocations){
					whoWhere.init.userInfoDialog.showFromHash();
					whoWhere.init.initHover.showFromHash();
				}
				whoWhere.utils.loader.hide();// hide loader
			}else{
				alert('json-данные, загруженные по адресу: "'+url+'"'+' имеют неверный формат');
				if(confirm('Попытаться загрузить последнюю рабочую копию?')){
					whoWhere.JSONToUsers.uploadLastWorkedVersion();// try to get last worked version
				}else{
					whoWhere.utils.loader.hide();// hide loader
				}
			}
		},
		error: function(err){
			alert('Ошибка при попытке получить json-данные по адресу: "'+url+'"');
			if(confirm('Попытаться загрузить последнюю рабочую копию?')){
				whoWhere.JSONToUsers.uploadLastWorkedVersion();// try to get last worked version
			}else{
				whoWhere.utils.loader.hide();// hide loader
			}
		}
	});
}
whoWhere.JSONToUsers.locationParse = function(obj){
	if(obj.locationArray && obj.locationArray.length){
		$locationList = $('.locations-list');
		$locationList.empty();
		var activeClass = 'active';
		var ii = 0;
		var locationArrayLength = obj.locationArray.length;
		for (; ii < locationArrayLength; ii++){
			(function(i){
				var currentLocation = obj.locationArray[i];
				var $switcher = $('.location-switcher-example li').clone();
				if(currentLocation.dataLocation){
					$switcher.attr({
						'data-location':currentLocation.dataLocation,
						'title':'Постфикс в имени файла с данными- "'+currentLocation.dataLocation+'"'
					});
				}
				if(currentLocation.text){
					$switcher.find('.text').html( whoWhere.utils.decode(currentLocation.text) );
				}
				if(currentLocation.activeState){
					$switcher.addClass(activeClass);
				}
				$locationList.append($switcher);
			}(ii));
		}
		whoWhere.JSONToUsers.setLocationAndHash();
	}else{
		alert('Загруженный файл не содержит локаций');
	}
}
whoWhere.JSONToUsers.setLocationAndHash = function () {
	var activeClass = 'active';
	var locationPostfix = whoWhere.utils.URIHash.get('location-postfix');
	var $locations = $('.locations-list li');
	var $activeLocation = $locations.filter('.active');
	if(!locationPostfix){
		whoWhere.utils.URIHash.set('location-postfix',  $activeLocation.attr('data-location'));
		return;
	}
	$locations.each(function(){
		var $this = $(this);
		if($this.attr('data-location')==locationPostfix){
			isLocationFromHash = true;
			$activeLocation.removeClass(activeClass);
			$this.addClass(activeClass);
			return false;
		}
	});
};
whoWhere.JSONToUsers.parse = function(obj){
	/* start location */
	if(obj && obj.location){
		var $location = $('.map');
		if(obj.location.url && obj.location.url != 'none'){
			$location
				.css('background-image',obj.location.url)
				.attr('data-background',obj.location.url);
		}
		if(obj.location.width){
			$location.css('width',obj.location.width);
		}
		if(obj.location.height){
			$location.css('height',obj.location.height);
		}
	}
	/* end location */
	/* start columns */
	if(obj && obj.columns && obj.columns.length){
		var $columns = $('.people .column');
		for (var columnsI = 0; columnsI < obj.columns.length; columnsI++){
			var currentColumn = obj.columns[columnsI];
			var $currentColumn = $columns.eq(columnsI);
			/* start teams */
			if( currentColumn.teamsArray && currentColumn.teamsArray.length){
				for (var teamsArrayI = 0; teamsArrayI < currentColumn.teamsArray.length; teamsArrayI++){
					var currentTeam = currentColumn.teamsArray[teamsArrayI];
					var $currentTeam = whoWhere.JSONToUsers.appendEl($('.examples-wrapper .team'),$currentColumn)
					whoWhere.JSONToUsers.setTextFromProp($currentTeam.find('.team-name'), currentTeam, 'name');// set team name
					/* start subteams */
					if( currentTeam.subteams && currentTeam.subteams.length){
						for (var subteamsI = 0; subteamsI < currentTeam.subteams.length; subteamsI++){
							var currentSubTeam = currentTeam.subteams[subteamsI];
							/* start people */
							if( currentSubTeam.people && currentSubTeam.people.length){
								for (var peopleI = 0; peopleI < currentSubTeam.people.length; peopleI++){
									/* START WORK WITH PEOPLE */
									var currentPeople = currentSubTeam.people[peopleI];
									// SIDE LINK
									var $currentPeople = whoWhere.JSONToUsers.appendEl($('.examples-wrapper .worker'),$currentTeam.find('.subteam'))
									var $sideLink = $currentPeople.find('.title');
									var $checkboxes = $currentPeople.find('.options-popup .checkbox');
									whoWhere.JSONToUsers.setTextFromProp($sideLink, currentPeople, 'name');// set user name
									// set basic email
									whoWhere.JSONToUsers.setAttrFromProp($sideLink,'data-mail',currentPeople,'basicMail');
									whoWhere.JSONToUsers.setAttrFromProp($sideLink,'href',currentPeople,'basicMail');
									$sideLink.attr('href','mailto:'+$sideLink.attr('href'));
									// ID
									whoWhere.JSONToUsers.setAttrFromProp($sideLink,'data-id',currentPeople,'id');
									// CENTER LINK
									var centerPlace = $('.map .view-content');
									var $centerRow = whoWhere.JSONToUsers.appendEl($('.examples-wrapper .views-row'),centerPlace)
									if(currentPeople.positionTop && currentPeople.positionLeft){// setPosition
										$centerRow.find('.employee').css({
											top: parseInt(currentPeople.positionTop)+'px',
											left: parseInt(currentPeople.positionLeft)+'px'
										});
									}else{
										whoWhere.utils.log(currentPeople,'has not top or left position');
									}
									// set user name
									var $centerName = $centerRow.find('.user-name');
									whoWhere.JSONToUsers.setTextFromProp($centerName, currentPeople, 'name');
									// set user position
									var $centerPosition = $centerRow.find('.user-position-name');
									whoWhere.JSONToUsers.setTextFromProp($centerPosition, currentPeople, 'positionName');
									// set basic email
										//link
									var $centerNameForSearch = $centerRow.find('.point');
									whoWhere.JSONToUsers.setAttrFromProp($centerNameForSearch,'data-mail',currentPeople,'basicMail');
									whoWhere.JSONToUsers.setAttrFromProp($centerNameForSearch,'href',currentPeople,'basicMail');
									$centerNameForSearch.attr('href','mailto:'+$centerNameForSearch.attr('href'));
										// ID
									whoWhere.JSONToUsers.setAttrFromProp($centerNameForSearch,'data-id',currentPeople,'id');
										//others boxes
									var $centerBasicMail = $centerRow.find('.user-basic-mail');
									whoWhere.JSONToUsers.setTextFromProp($centerBasicMail, currentPeople, 'basicMail');
									// set user img
									var $centerImg = $centerRow.find('.user-image');
									whoWhere.JSONToUsers.setAttrFromProp($centerImg, 'src' , currentPeople, 'photoSrc');
									// set user login
									var $centerLogin = $centerRow.find('.user-login');
									whoWhere.JSONToUsers.setTextFromProp($centerLogin, currentPeople, 'login');
									// set user phones
									whoWhere.JSONToUsers.setElsFromArray(currentPeople,'phones',$centerRow.find('.phones'));
									// set user mails
									whoWhere.JSONToUsers.setElsFromArray(currentPeople,'mails',$centerRow.find('.mails'));
									// set user messengers
									whoWhere.JSONToUsers.setElsFromObjArray(currentPeople,'messengers',$centerRow.find('.messengers'));
									// SET USER PROPS-CLASSES
									if(currentPeople.stylesProp){
										var stylesProp;
										for (stylesProp in currentPeople.stylesProp){
											if(stylesProp){
												$sideLink.addClass(stylesProp);// add classes
												$centerNameForSearch.addClass(stylesProp);// add classes
												$checkboxes.filter('[value='+stylesProp+']').prop("checked", true);// set checkboces state
											}
										};
									}
									/* END WORK WITH PEOPLE */
								};
							}else{
								whoWhere.utils.log('subteam',currentSubTeam,'has not people');
								continue;
							}
							/* end people */
						};
					}else{
						whoWhere.utils.log('team',currentTeam,'has not subteams');
						continue;
					}
					/* end subteams */
				};
			}else{
				whoWhere.utils.log('column',currentColumn,'has not teams');
				continue;
			}
			/* end teams */
		}
	}
	/* end columns */
	whoWhere.JSONToUsers.parseComplete();// trigger complete callback
}
/* end json-to-users */
/* START CALLBACKS */
whoWhere.JSONToUsers.beforeRun = function(){
	whoWhere.utils.loader.show();// show loader
}
whoWhere.JSONToUsers.parseComplete = function(){
	if(whoWhere.sortDrag){
		whoWhere.sortDrag.initSortable();//refresh sortable;
	}
	/* START SAVE LAST WORKED */
	if(whoWhere.usersToJSON){
		var jsonOuntput = whoWhere.usersToJSON.getJson();
		var saveLastWorkedRequest = $.post(// save json to file
			'inc/php/save-to-file.php',
			{
				fileName:'last-worked-location-'+$('.locations-list .active').eq(0).attr('data-location')+'.json',
				json:jsonOuntput
			},
			function(R){// success
				whoWhere.utils.log('last-worked file save success');
			}
		).error(function(){
			whoWhere.utils.log('last-worked file save error');
		}).complete(function(){
			whoWhere.utils.loader.hide();// hide loader
		});
	}else{
		whoWhere.utils.loader.hide();// hide loader
	}
	/* END SAVE LAST WORKED */
	if(whoWhere.utils){
		whoWhere.utils.setPageMinWidth();// RESET MIN WIDTH TO PAGE
	}
}
/* END CALLBACKS */
/* BEGIN UTILS */
whoWhere.JSONToUsers.setElsFromObjArray = function(obj,prop,$objsWrapper,logFlag){
	if(obj && obj[prop] && obj[prop].length){
		var _i = 0;
		var _length = obj[prop].length;
		var appendObj = $objsWrapper.children();
		for (var _i = 0; _i < _length; _i++){
			var _currentProp = obj[prop][_i];
			var appendObjClone = appendObj.clone();
			var name = _currentProp['name'];
			var value = _currentProp['value'];
			if(name && value){
				$objsWrapper.closest('.hidden').removeClass('hidden');
			}
			appendObjClone.find('.name').html(whoWhere.utils.decode(name));
			appendObjClone.find('.value').html(whoWhere.utils.decode(value));
			$objsWrapper.append(appendObjClone);
		};
		appendObj.remove();
	}else if(logFlag){
		whoWhere.utils.log('Propertie with name:',prop,'in object', obj ,'is undefined or has not length');
	}
}
whoWhere.JSONToUsers.setElsFromArray = function(obj,prop,$objsWrapper,logFlag){
	if(obj && obj[prop] && obj[prop].length){
		var _i = 0;
		var _length = obj[prop].length;
		var appendObj = $objsWrapper.children();
		for (var _i = 0; _i < _length; _i++){
			var _currentProp = obj[prop][_i];
			if(_currentProp){
				$objsWrapper.closest('.hidden').removeClass('hidden');
			}
			var appendObjClone = appendObj.clone();
			$objsWrapper.append(appendObjClone.html(whoWhere.utils.decode(_currentProp)));
		};
		appendObj.remove();
	}else if(logFlag){
		whoWhere.utils.log('Propertie with name:',prop,'in object', obj ,'is undefined or has not length');
	}
}
whoWhere.JSONToUsers.setAttrFromProp = function(el,elAttr,obj,prop,noLogFlag){
	if(prop in obj){
		el.attr(elAttr,whoWhere.utils.decode(obj[prop]));
	}else if(!noLogFlag){
		whoWhere.utils.log('Propertie with name:',prop,'in object', obj ,'is undefined');
	}
}
whoWhere.JSONToUsers.setTextFromProp = function(el,obj,prop,noLogFlag){
	if(prop in obj){
		el.closest('.hidden').removeClass('hidden');
		el.html(whoWhere.utils.decode(obj[prop]));
	}else if(!noLogFlag){
		whoWhere.utils.log('Propertie with name:',prop,'in object', obj ,'is undefined');
	}
}
whoWhere.JSONToUsers.appendEl = function(cloneEl,elToAppend){
	var elToReturn = cloneEl.clone().appendTo(elToAppend);
	return elToReturn;
}
/* END UTILS */
})(jQuery);// end jQuery closure