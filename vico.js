// vico is the abbreviation of "visualization components"
var vico;

var vicoElementsStr;

vico = function (input) {
	if (! (this instanceof vico)) {
		return new vico(input);
	} 

	this.input = input;

	this.alertQueue;

	this.filterRet;

	this.currentPage;

	this.iconsSelected;

	this.afterAlert;

}

// alert feature
vico.prototype.alert = function (obj) {
	var it;

	it = this;

	// renew alert queue
	// the alert queue is getting from two places, make it more flexible
	if (obj && obj['queue']) {
		this.alertQueue = obj['queue'];
	} else {
		this.alertQueue = this.input;
	}

	// no input
	if (!this.alertQueue || (Object.prototype.toString.call(this.alertQueue) !== "[object Array]" && Object.prototype.toString.call(this.alertQueue) !== "[object String]")) {
		throw new Error('请声明需要alert的数组');
		return;
	}

	if (Object.prototype.toString.call(this.alertQueue) === "[object String]") {
		try {
			this.alertQueue = JSON.parse(this.alertQueue);
		} catch (e) {
			throw new Error('声明的数组有误');
		}
	}

	// remove cover and alert window possibly existed
	$('#vico_cover').remove();
	$('#vico_alert_window').remove();
	$('body').removeClass('vico_body_fixed');

	// add cover to body element
	$('body').addClass('vico_body_fixed');
	$('body').append(vicoElementsStr.cover);
	
	$('#vico_cover').css('top', $(window).scrollTop() + 'px');

	function displayAlert() {
		// add alert
		$('#vico_cover').append(vicoElementsStr.alertWindow);

		// fill the content
		$('#vico_alert_content').text(it.alertQueue.shift());

		// fill the alert title
		if (obj && obj['title']) {

			$('#vico_alert_close').before(obj['title']);

		}

		// fill the alert title
		if (obj && obj['button']) {

			$('#vico_alert_confirm_btn').text(obj['button']);

		}
	}

	displayAlert();

	// live bind the close btn
	$('#vico_cover').on('click', '#vico_alert_close, #vico_alert_confirm_btn', function () {

		$('#vico_alert_window').remove();

		if (it.alertQueue.length === 0) {
			$('body').removeClass('vico_body_fixed');
			$('#vico_cover').remove();

			if (obj && obj['callback']) {
				obj['callback']();
			} else if (it.afterAlert) {
				it.afterAlert();
			}

			return;
		}

		// make some delay
		setTimeout(displayAlert, 200);

	});

	return this;
}

vico.prototype.then = function (callback) {
	this.afterAlert = callback;
}

// autocomplete feature
vico.prototype.autocomplete = function (obj) {
	var sourceType, instance, container;

	instance = this;

	// check if the element exists
	if ($(this.input).length === 0) {
		throw new Error('元素初始化失败');
		return;
	}

	// check if the param type is right
	if (Object.prototype.toString.call(obj) !== '[object Object]') {
		throw new Error('参数不正确');
		return;
	}

	// check if basic key is in obj
	if (!obj['source']) {
		throw new Error('参数缺失');
		return;
	}

	// check if basic key is in right type
	// 'source' supports array, string and function 
	sourceType = Object.prototype.toString.call(obj['source']);
	if (!(sourceType === '[object Array]' || sourceType === '[object Function]' || sourceType === '[object String]')) {
		throw new Error('参数source设置有误');
		return;
	}

	// get async value
	if (obj['async'] === undefined) {
		obj['async'] = true;
	}

	// if cource type is string, get data firstly
	if (sourceType  === '[object String]') {
		$.ajax({
			url: obj['source'],
			async: obj['async'],
			success: function (d) {
				obj['source'] = JSON.parse(d);
			}
		})
	}


	// hide the origin element
	$(this.input).css('visibility', 'hidden');

	// insert after the origin element
	$(this.input).after(vicoElementsStr.autocompleteContainer);

	// bind the container variable to the specific container element
	container = $(this.input).next('.vico_autocomplete_container');

	// define functions used repeatly
	
	// the function is to update filter ret
	function updateFilterRet(query) {
		var i, regexStr, regexObj;
		if (sourceType === '[object Array]' || sourceType === '[object String]') {
			regexStr = '.*';
			// turn input into regex
			for (i = 0; i < query.length; i++) {

				// not [^A-Za-z0-9_]
				if (query[i].match(/^\W$/)) {
					regexStr += '\\';
				}

				regexStr += query[i];

				regexStr += '.*';
			}

			if (obj['sensitive'] === false) {
				regexObj = new RegExp(regexStr, 'i');
			} else {
				regexObj = new RegExp(regexStr);
			}

			// filter result
			instance.filterRet = [];
			obj['source'].forEach(function (v) {
				var hl, str, q;
				q = query.split('');
				str = [];

				if (regexObj.test(v)) {
					hl = q.shift();


					for (i = 0; i < v.length; i++) {
						if (hl !== undefined && hl.toLowerCase() === v[i].toLowerCase()) {

							str.push('<b class="vico_b">' + v[i] + '</b>');
							hl = q.shift();


						} else {
							str.push(v[i]);
						}
					}

					str = str.join('');

					instance.filterRet.push(str);
				}
			});

		} else if (sourceType === '[object Function]') {
			obj['source'](query, function (ret) {
				instance.filterRet = ret;
			});
		}

		// if the option has length property
		if (parseInt(obj['length']) >= 0) {
			instance.filterRet = instance.filterRet.slice(0, parseInt(obj['length']));
		}
	}

	// the function is to show dropdown menu 
	function displayDropdown() {
		// remove the dropdown
		container.find('.vico_dropdown').remove(); 

		updateFilterRet(container.find('.vico_autocomplete_input').val());
		
		// add dropdown
		if (instance.filterRet.length >= 1) {
			container.append(vicoElementsStr.dropdown);
			instance.filterRet.forEach(function (v) {

				$(vicoElementsStr.dropdownItem).html(v)
					.appendTo(container.find('.vico_dropdown'));
			});

			container.find('.vico_autocomplete_input').focus();

			// no need to bind event on every item
			// the dropdown menu just delegates it
			container.find('.vico_dropdown').on('click', '.vico_dropdown_item', function () {
				container.prev('input').val($(this).text());
				container.find('.vico_autocomplete_input').focus().val($(this).text());

				if ($(this).text()) {
					container.find('.vico_autocomplete_clear').css('opacity', 1);
				}

				container.find('.vico_dropdown').remove();
			});

			// also the dropdown menu delegates the mouseover event
			container.find('.vico_dropdown').on('mouseover', '.vico_dropdown_item', function () {
				highlightItem($(this));
			});
		}
	}

	// the function is to highlight the item
	function highlightItem(item) {
		var depth, itemHeight, upper, lower;

		itemHeight = 33;
		upper = 70;
		lower = 150;

		item.addClass('vico_dropdown_item_highlight');
		item.siblings().removeClass('vico_dropdown_item_highlight');
		container.prev('input').val(item.text());
		item.closest('.vico_dropdown').siblings('.vico_autocomplete_input').val(item.text());

		depth = item.index()*itemHeight + upper;
		// adjust the offset if neccessay
		if (depth - item.closest('.vico_dropdown').scrollTop() > lower) {
			item.closest('.vico_dropdown').scrollTop(depth - lower);
		} else if (depth - item.closest('.vico_dropdown').scrollTop() < upper) {
			item.closest('.vico_dropdown').scrollTop(depth - upper);
		}
	}

	//key up event
	container.find('.vico_autocomplete_input').on('keyup', function (e) {

		container.prev('input').val($(this).val());

		if ($(this).val()) {
			$(this).next('.vico_autocomplete_clear').css('opacity', 1);
		} else {
			$(this).next('.vico_autocomplete_clear').css('opacity', 0);
			
			if (!obj['select']) {
				// clear the dropdown menu
				$(this).siblings('.vico_dropdown').remove(); 
				return;
			}
		}

		// "direction" and "enter" press should be prevented
		if (e.keyCode !== 13 && e.keyCode !== 38 && e.keyCode !== 40) {
			
			displayDropdown();

		} else {
			if (e.keyCode === 38) {
				
				// if no highlight item, highlight the first one
				if (!container.find('.vico_dropdown_item_highlight').length) {
					highlightItem(container.find('.vico_dropdown_item').first());
				} else if (container.find('.vico_dropdown_item_highlight').is(':first')){
					return;
				} else {
					highlightItem(container.find('.vico_dropdown_item_highlight').prev());
				}

			} else if (e.keyCode === 40) {
				
				if (!container.find('.vico_dropdown_item_highlight').length) {
					highlightItem(container.find('.vico_dropdown_item').first());
				} else if (container.find('.vico_dropdown_item_highlight').is(':last')){
					return;
				} else {
					highlightItem(container.find('.vico_dropdown_item_highlight').next());
				}

			} else if (e.keyCode === 13) {
				
				// only work when there is highlighted item
				if (container.find('.vico_dropdown_item_highlight').length) {
					container.prev('input').val(container.find('.vico_dropdown_item_highlight').text());
					container.find('.vico_autocomplete_input').focus().val(container.find('.vico_dropdown_item_highlight').text());

					if (0 && container.text()) {
						container.find('.vico_autocomplete_clear').css('opacity', 1);
					}

				}

				// remove the dropdown anyway event there is no highlight
				container.find('.vico_dropdown').remove();

			}
		}
		
	});

	// clear btn
	container.find('.vico_autocomplete_clear').on('click', function () {

		container.prev('input').val('');
		$(this).prev('.vico_autocomplete_input').focus().val('');
		$(this).css('opacity', 0);
		$(this).siblings('.vico_dropdown').remove();

	});

	// highlight the container while its input is focus
	container.find('.vico_autocomplete_input').on('focus', function () {
		container.css('border', '1px solid #BB1C1C');
	});

	// de-highlight the container whilte its input is blur
	container.find('.vico_autocomplete_input').on('blur', function () {
		var it;
		it = this;
		container.css('border', '1px solid #ddd');
		setTimeout(function () {
			$(it).siblings('.vico_dropdown').remove(); 
		}, 150);
	});

	// select feature
	if (obj['select']) {
		// add caret btn
		container.append(vicoElementsStr.selectBtn);

		container.find('.vico_select_btn').on('click', function () {

			if ($(this).siblings('.vico_dropdown').length) {
				$(this).siblings('.vico_dropdown').remove();
			} else {

				setTimeout(displayDropdown.bind(this, container), 300);

			}
		});
	}
}

vico.prototype.iconPicker = function (obj) {
	var iconNum, instance;

	instance = this;

	// display 64 icons per page
	iconNum = 64;

	// remove cover and alert window possibly existed
	$('#vico_cover').remove();
	$('body').removeClass('vico_body_fixed');

	// add cover to body element
	$('body').append(vicoElementsStr.cover);
	$('#vico_cover').css('top', $(window).scrollTop() + 'px');

	$('body').addClass('vico_body_fixed');
	$('#vico_cover').append(vicoElementsStr.iconPicker);

	$('#vico_icon_picker').append(vicoElementsStr.pickerBar);
	$('#vico_icon_picker').append(vicoElementsStr.pickerToolbar);
	$('#vico_icon_picker').append(vicoElementsStr.pickerContent);

	// init and add icon
	if (!obj || Object.prototype.toString.call(obj) !== '[object Object]') {
		obj = {
			multiple: true // default value
		}
	} else {
		if (obj['multiple'] === undefined) {
			obj['multiple'] = true;
		}
	}

	this.currentPage = 0;

	this.iconsSelected = {};

	// check if the user has introduced the ioniconslist.js
	if (!ioniconList) {
		throw new Error('未引入ioniconslist.js文件');
	}

	function displayPage() {
		var i, item;
		
		$('#vico_picker_content').empty();

		for (i = this.currentPage*iconNum; i < ((this.currentPage + 1)*iconNum < 732 ? (this.currentPage + 1)*iconNum : 732) ; i ++) {
			item = $(vicoElementsStr.iconItem);

			item.appendTo('#vico_picker_content')
				.find('i')
				.attr({
					class: ioniconList[i],
					title: ioniconList[i]
				});


			if (this.iconsSelected[item.find('i').attr('class')] !== undefined) {
				item.addClass('vico_item_chosen');
			}
		}

		if (this.currentPage == 0) {
			$('#vico_picker_prev').addClass('vico_picker_disabled');
		} else {
			$('#vico_picker_prev').removeClass('vico_picker_disabled');
		}

		if (this.currentPage == 11) {
			$('#vico_picker_next').addClass('vico_picker_disabled');
		} else {
			$('#vico_picker_next').removeClass('vico_picker_disabled');
		}

	}

	displayPage.call(this);

	// events bind

	$('#vico_picker_next').on('click', function () {
		
		if ($('.vico_item_chosen_front').length) {
			instance.iconsSelected[$('.vico_item_chosen_front').find('i').attr('class')] = $('#vico_picker_input').val();
			$('#vico_picker_input').val('');
		}


		if (instance.currentPage === 11) {
			return;
		}

		instance.currentPage ++;
		displayPage.call(instance);
	});

	$('#vico_picker_prev').on('click', function () {
		
		if ($('.vico_item_chosen_front').length) {
			instance.iconsSelected[$('.vico_item_chosen_front').find('i').attr('class')] = $('#vico_picker_input').val();
			$('#vico_picker_input').val('');
		}


		if (instance.currentPage === 0) {
			return;
		}

		instance.currentPage --;
		displayPage.call(instance);
	});

	$('#vico_picker_btn').on('click', function () {
		var res, i;
		res = [];

		if ($('.vico_item_chosen_front').length) {
			instance.iconsSelected[$('.vico_item_chosen_front').find('i').attr('class')] = $('#vico_picker_input').val();
		}

		for (i in instance.iconsSelected) {
			res.push({
				class: i,
				title: instance.iconsSelected[i]
			});
		}

		// close the window
		$('#vico_cover').remove();
		$('#vico_icon_picker').remove();
		$('body').removeClass('vico_body_fixed');


		if (Object.prototype.toString.call(obj['callback']) === '[object Function]') {
			obj['callback'](res);
		}

	});
	

	$('#vico_icon_picker').on('click', '.vico_icon_item', function () {
		var idx;


		if ($('.vico_item_chosen_front').length) {
			instance.iconsSelected[$('.vico_item_chosen_front').find('i').attr('class')] = $('#vico_picker_input').val();
		}

		$('#vico_picker_input').val('');

		if ($(this).hasClass('vico_item_chosen')) {

			if ($(this).hasClass('vico_item_chosen_front')) {
				
				$(this).removeClass('vico_item_chosen_front')
					.removeClass('vico_item_chosen');

				delete instance.iconsSelected[$(this).find('i').attr('class')];

			} else {
				
				$('.vico_item_chosen_front').removeClass('vico_item_chosen_front');
				$(this).addClass('vico_item_chosen_front');
				$('#vico_picker_input').val(instance.iconsSelected[$(this).find('i').attr('class')]).focus();
			
			}

		} else {
			$('.vico_item_chosen_front').removeClass('vico_item_chosen_front');

			// if 'multiple' property is set to false

			if (!obj['multiple']) {
				$('.vico_item_chosen_front').removeClass('vico_item_chosen_front');
				$('.vico_item_chosen').removeClass('vico_item_chosen');
				instance.iconsSelected = {};
			}

			$(this).addClass('vico_item_chosen')
				.addClass('vico_item_chosen_front');


			instance.iconsSelected[$(this).find('i').attr('class')] = '';

			$('#vico_picker_input').focus();
		}

	});

	$('#vico_picker_bar span').click(function () {
		$(this).closest('#vico_icon_picker').remove();
		$('#vico_cover').remove();
		$('body').removeClass('vico_body_fixed');

	});
}

vicoElementsStr = {
	cover: '<div id="vico_cover"></div>',
	alertWindow: '<div id="vico_alert_window"><div id="vico_alert_bar"><span id="vico_alert_close">x</span></div><div id="vico_alert_content"></div><div id="vico_alert_confirm"><div id="vico_alert_confirm_btn">确定</div></div></div>',
	autocompleteContainer: '<div class="vico_autocomplete_container"><input type="text" class="vico_autocomplete_input" autocomplete="off"/><span class="vico_autocomplete_clear">X</span></div>',
	dropdown: '<div class="vico_dropdown"></div>',
	dropdownItem: '<div class="vico_dropdown_item"></div>',
	selectBtn: '<div class="vico_select_btn"><span></span></div>',
	iconPicker: '<div id="vico_icon_picker"></div>',
	pickerBar: '<div id="vico_picker_bar"><span>X</span></div>',
	pickerContent: '<div id="vico_picker_content"></div>',
	pickerToolbar: '<div id="vico_picker_toolbar"><input id="vico_picker_input"/><button  id="vico_picker_btn">完成</button><span id="vico_picker_next">下一页</span><span id="vico_picker_prev">上一页</span></div>',
	iconItem: '<div class="vico_icon_item"><span class="vico_icon_entity "><i class="ion-alert"></i></span><span class="vico_icon_title"></span></div>'
}
