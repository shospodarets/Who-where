/**
 * Who-where - JavaScipt- application
 * Copyright (c) 2011-2012 Sergey Gospodarets ( http://gospodarets.com/ | sgospodarets@gmail.com )
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
// REQUIREDS:
// OTHER: whoWhere.JSONToUsers
// THIS:  -
(function($){// start jQuery closure
$(document).unbind('ready.whoWhere.usersToJSON').bind('ready.whoWhere.usersToJSON',function(){// document ready
	$('body').eq(0).removeClass('view-mode');// TURN OFF EDIT_MODE (REMOVE VIEW MODE CLASS FROM BODY)
	whoWhere.usersToJSON.init();
});
if(!window.whoWhere){
	window.whoWhere = {};
}
whoWhere.usersToJSON = {}
whoWhere.usersToJSON.init = function(){// INIT
	$('.donwload-upload-btns .download-on-server').unbind('click.toJson').bind('click.toJson',function(e){
		e.preventDefault();
		whoWhere.usersToJSON.run();
	});
}
/* begin user-to-json */
whoWhere.usersToJSON.run = function(){
	whoWhere.usersToJSON.beforeRun();
	
	var jsonLocations = whoWhere.usersToJSON.getLocationsJSON();
	$.post(// SAVE JSON-LOCATION TO FILE
		'inc/php/save-to-file.php',
		{
			fileName:'locations-list.json',
			json:jsonLocations
		},
		function(R){
			// SUCCESS
			var fileName = 'who-where-location-'+$('.locations-list .active').eq(0).attr('data-location')+'.json';
			var jsonOuntput = whoWhere.usersToJSON.getJson();
			$.post(// save json to file
				'inc/php/save-to-file.php',
				{
					fileName:fileName,
					json:jsonOuntput,
					withBackupCopy:1
				},
				function(R){// success
					whoWhere.utils.log(R);
				}
			)
			.error(function(R){
				alert('Ошибка при попытке сохранения в файл'+fileName);
			})
			.complete(function(){
				whoWhere.utils.loader.hide();// hide loader
				whoWhere.usersToJSON.parseComplete();
			});
			
		}
	)
	.error(function(R){
		alert('Ошибка при попытке сохранения в файл locations-list.json');
		whoWhere.utils.loader.hide();// hide loader
		whoWhere.usersToJSON.parseComplete();
	})
	.complete(function(){
	});
	
}
whoWhere.usersToJSON.getJson = function(){
	/* BEGIN BEFORE SECTION */
	var userLinksOnMap = $('.map .employee .point');
	/* END BEFORE SECTION */
	
	// BEGIN usersToJSON
	var obj = {};
	// BEGIN LOCATION
	var $location = $('.map');
	obj['location'] = {};
	obj['location']['url'] = $location.attr('data-background');
	obj['location']['width'] = parseInt($location.width()) || 0;
	obj['location']['height'] = parseInt($location.height()) || 0;
	// END LOCATION
	// BEGIN COLUMNS
	var columnsArray = [];// declaration
	if($('.people .column').length){
		$('.people .column').each(function(columnIndex){
			var $thisColumn = $(this);
			var columnsObj = {};// declaration
			// BEGIN TEAMS
			var teamsArray = [];// declaration
			if($thisColumn.find('.team').length){
				$thisColumn.find('.team').each(function(){
					$thisTeam = $(this);
					var teamObj = {};// declaration
					whoWhere.usersToJSON.setPropFromEl(teamObj,'name',$thisTeam.find('.team-name'));
						// BEGIN SUBTEAMS
						var subteamsArray = [];// declaration
						if($thisTeam.find('.subteam').length){
							$thisTeam.find('.subteam').each(function(){
								$thisSubTeam = $(this);
								var subTeamObj = {};// declaration
								whoWhere.usersToJSON.setPropFromEl(subTeamObj,'name',$thisSubTeam.find('.subteam-name'));
								// BEGIN PEOPLES
								var peopleArray = [];// declaration
								if($thisSubTeam.find('.title').length){
									$thisSubTeam.find('.title').each(function(){
										// BEGIN PEOPLE
										/* vars */
										$thisPeople = $(this);
										var $thisPeopleOnMap = userLinksOnMap.filter('[href="'+$thisPeople.attr('href')+'"]');
										var $thisPositionBox = $thisPeopleOnMap.closest('.employee');
										var $thisPopupBox = $thisPeopleOnMap.siblings('.user-popup');
										if($thisPeopleOnMap.data('popup')){
											var $thisLightBox = $thisPeopleOnMap.data('popup');
										}else{
											var $thisLightBox = $thisPeopleOnMap.siblings('.user-lightbox');
										}
										/* sets */
										var peopleObj = {};//declaration
										
										whoWhere.usersToJSON.setPropFromEl(peopleObj,'name',$thisPeople);
										whoWhere.usersToJSON.setPropFromEl(peopleObj,'id',$thisPeopleOnMap,'data-id');// ID
										whoWhere.usersToJSON.setPropFromEl(peopleObj,'basicMail',$thisPeople,'data-mail');
										whoWhere.usersToJSON.setPropFromEl(peopleObj,'positionName',$thisPopupBox.find('.user-position-name'));
										whoWhere.usersToJSON.setPropFromEl(peopleObj,'photoSrc',$thisPopupBox.find('.user-image'),'src');
										whoWhere.usersToJSON.setProp(peopleObj,'positionTop',parseInt($thisPositionBox.css('top')));
										whoWhere.usersToJSON.setProp(peopleObj,'positionLeft',parseInt($thisPositionBox.css('left')));
										whoWhere.usersToJSON.setPropFromEl(peopleObj,'login',$thisLightBox.find('.user-login'));
										// BEGIN PHONES
											var phones = [];//declaration
												$thisLightBox.find('.phones *').each(function(){
													whoWhere.usersToJSON.pushPropFromEl(phones,$(this));
												});
											peopleObj['phones'] = phones;//add to json
										// END PHONES
										// BEGIN MAILS
											var mails = [];//declaration
												$thisLightBox.find('.mails *').each(function(){
													whoWhere.usersToJSON.pushPropFromEl(mails,$(this));
												});
											peopleObj['mails'] = mails;//add to json
										// END MAILS
										// BEGIN MESSENGERS
											var messengers = [];//declaration
												$thisLightBox.find('.messengers span').each(function(){
													//whoWhere.usersToJSON.pushPropFromEl(messengers,$(this));
													whoWhere.usersToJSON.pushObjFromEls(messengers,'name',$(this).find('.name'),'value',$(this).find('.value'));
												});
											peopleObj['messengers'] = messengers;//add to json
										// END MESSENGERS
										// BEGIN STYLES-PROP
											var stylesProp = {};//declaration
												whoWhere.usersToJSON.setProp(stylesProp,'head',$thisPeople.hasClass('head'),'noLog');
												whoWhere.usersToJSON.setProp(stylesProp,'lead',$thisPeople.hasClass('lead'),'noLog');
												whoWhere.usersToJSON.setProp(stylesProp,'qa',$thisPeople.hasClass('qa'),'noLog');
												whoWhere.usersToJSON.setProp(stylesProp,'student',$thisPeople.hasClass('student'),'noLog');
												whoWhere.usersToJSON.setProp(stylesProp,'probation',$thisPeople.hasClass('probation'),'noLog');
												whoWhere.usersToJSON.setProp(stylesProp,'workFromHome',$thisPeople.hasClass('workFromHome'),'noLog');
												whoWhere.usersToJSON.setProp(stylesProp,'director',$thisPeople.hasClass('director'),'noLog');
												whoWhere.usersToJSON.setProp(stylesProp,'contractor',$thisPeople.hasClass('contractor'),'noLog');
											peopleObj['stylesProp'] = stylesProp;//add to json
										// END STYLES-PROP
										
										peopleArray.push(peopleObj);// add to json
										// BEGIN PEOPLE
									});
								}else{
									whoWhere.utils.log('subteam has not peoples',$thisSubTeam);
								}
								subTeamObj['people'] = peopleArray;// add to json
								// END PEOPLES
								subteamsArray.push(subTeamObj);//add to json
							});
						}else{
							whoWhere.utils.log('team has not subteams',$thisTeam);
						}
						teamObj['subteams'] = subteamsArray;// add to json
						// END SUBTEAMS
					teamsArray.push(teamObj);// add to json
				});
			}else{
				whoWhere.utils.log('column has not teams:',$thisColumn);
				return;
			}
			columnsObj['teamsArray'] = teamsArray;// add to json
			// END TEAMS
			columnsArray.push(columnsObj);// add to json
		});
	}else{
		whoWhere.utils.log('page has not columns');
		return;
	}
	obj['columns'] = columnsArray;// add to json
	// END COLUMNS
	// END usersToJSON
	var jsonOuntput = JSON.stringify(obj);
	whoWhere.utils.log(jsonOuntput);
	return jsonOuntput;
}
/* end user-to-json */
/* START getLocationsJSON */
whoWhere.usersToJSON.getLocationsJSON = function(){
	var locationObj = {};
	locationObj['locationArray'] = [];
	var $locations = $('.locations-list li');
	var activeClass = 'active';
	$locations.each(function(){
		var $location = $(this);
		var obj = {};
		obj['dataLocation'] = $.trim( $location.attr('data-location') );
		obj['text'] = whoWhere.utils.simpleEncode($location.find('.text').text());
		obj['activeState'] = $location.hasClass(activeClass) ? 1 : 0;
		locationObj['locationArray'].push(obj);
	});
	return JSON.stringify(locationObj);
}
/* END getLocationsJSON */
/* START CALLBACKS */
whoWhere.usersToJSON.beforeRun = function(){
	whoWhere.utils.loader.show();// show loader
}
whoWhere.usersToJSON.parseComplete = function(){
	whoWhere.utils.loader.hide();// hide loader
}
/* END CALLBACKS */
/* BEGIN UTILS */
whoWhere.usersToJSON.setPropFromEl = function(obj,prop,$el,attrName){
	if($el && $el.length){
		if(attrName){
			if($el.attr(attrName)){
				obj[prop] = whoWhere.utils.encode( $el.attr(attrName) );
			}else{
				whoWhere.utils.log($el,'attribute',attrName,'length is 0, false or undefined');
			}
		}else{
			if($el.text().length){
				obj[prop] = whoWhere.utils.encode( $el.text() );
			}else{
				whoWhere.utils.log($el,'text length is 0');
			}
		}
	}
}
whoWhere.usersToJSON.setProp = function(obj,prop,value,noLogFlag){
	if(value || value===0){
		obj[prop] = whoWhere.utils.encode( value );
	}else if(!noLogFlag){
		whoWhere.utils.log('Value length is 0, false or undefined for property', prop, 'in', obj );
	}
}
whoWhere.usersToJSON.pushPropFromEl = function(_array,$el,attrName,logFlag){
	if($el && $el.length){
		if(attrName){
			if($el.attr(attrName)){
				_array.push( whoWhere.utils.encode( $el.attr(attrName) ) );
			}else if(logFlag){
				whoWhere.utils.log($el,'attribute',attrName,'length is 0, false or undefined');
			}
		}else{
			if($el.text().length){
				_array.push( whoWhere.utils.encode( $el.text() ) );
			}else if(logFlag){
				whoWhere.utils.log($el,'text length is 0');
			}
		}
	}
}
whoWhere.usersToJSON.pushProp = function(_array,prop,value){
	if(value){
		_array.push( whoWhere.utils.encode( value ) );
	}else{
		whoWhere.utils.log('Value length is 0, false or undefined for property', prop, 'in', obj );
	}
}
whoWhere.usersToJSON.pushObjFromEls = function(_array){
	for (var i = 0; i < arguments.length; i++){
		if(!i){
			continue;
		}
		var objToPush = {};
		var valueName = arguments[i];
		var value = arguments[i+1].text();
		if(!value){
			whoWhere.utils.log('Value length is 0, false or undefined for element', valueName, 'in', _array );
		}
		objToPush[valueName]= value;
		var valueName2 = arguments[i+2];
		var value2 = arguments[i+3].text();
		if(!value){
			whoWhere.utils.log('Value length is 0, false or undefined for element', valueName, 'in', _array );
		}
		objToPush[valueName2]= value2;
		_array.push(objToPush);
		i+=3;
	};
	//(messengers,'name',$(this).find('.name'),'value',$(this).find('.value'));
	
}
/* END UTILS */
})(jQuery);// end jQuery closure