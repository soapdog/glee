/**
 * gleeBox: Keyboard goodness for your web.
 * 
 * Licensed under the GPL license (http://www.gnu.org/licenses/gpl.html)
 * Copyright (c) 2009 Ankit Ahuja
 * Copyright (c) 2009 Sameer Ahuja
 *
 *
 **/

jQuery(document).ready(function(){
	//activating the noConflict mode of jQuery
	jQuery.noConflict();
	
	/* initialize the searchBox */
	Glee.initBox();
		
	// Bind Keys
	jQuery(window).bind('keydown',function(e){
		var target = e.target || e.srcElement;
		//pressing 'g' if an input field is not focussed or alt+g(option+g on mac) anytime toggles the gleeBox
		if(Glee.status != 0)
		{
			if(e.keyCode == 71 && ((target.nodeName.toLowerCase() != 'input' && target.nodeName.toLowerCase() != 'textarea' && target.nodeName.toLowerCase() != 'div') || e.altKey))
			{
				e.preventDefault();
				Glee.userPosBeforeGlee = window.pageYOffset;
				//set default subtext
				Glee.subText.html("Nothing selected");
				if(target.nodeName.toLowerCase() == 'input' || target.nodeName.toLowerCase() == 'textarea' || target.nodeName.toLowerCase() == 'div')
					Glee.userFocusBeforeGlee = target;
				else
					Glee.userFocusBeforeGlee = null;
				if(Glee.searchBox.css('display') == "none")
				{
					//reseting value of searchField
					Glee.searchField.attr('value','');
					Glee.searchBox.fadeIn(150);
					Glee.searchField.focus();
				}
				else
				{
					Glee.closeBox();
				}
			}
		}
	});
	Glee.searchField.bind('keydown',function(e){
		//pressing 'esc' hides the gleeBox
		if(e.keyCode == 27)
		{
			e.preventDefault();
			Glee.closeBox();
		}
		else if(e.keyCode == 9)
		{
			e.stopPropagation();
			e.preventDefault();
		}
		else if(e.keyCode == 40 || e.keyCode == 38) //when arrow keys are down
		{
			Glee.simulateScroll((e.keyCode == 40 ? 1:0));
		}
	});

	Glee.searchField.bind('keyup',function(e){
		var value = Glee.searchField.attr('value');
		//check if the content of the text field has changed
		if(Glee.searchText != value)
		{
			e.preventDefault();
			if(value != "")
			{
				Glee.toggleActivity(1);

				if(value[0] != "?"
					&& value[0] != "!"
					&& value[0] != ":"
					&& value[0] != '*')
				{
					if(Glee.commandMode)
						LinkReaper.unreapAllLinks();
					Glee.commandMode = false;
					//default behavior in non-command mode, i.e. search for links
					//if a timer exists, reset it
					Glee.resetTimer();

					// start the timer
					Glee.timer = setTimeout(function(){
						LinkReaper.reapLinks(jQuery(Glee.searchField).attr('value'));
						Glee.selectedElement = LinkReaper.getFirst();
						Glee.setSubText(Glee.selectedElement,"el");
						Glee.scrollToElement(Glee.selectedElement);
						Glee.toggleActivity(0);
					},380);
				}
				//else command mode
				else {
					LinkReaper.unreapAllLinks();
					Glee.commandMode = true;
					Glee.resetTimer();
					Glee.toggleActivity(0);
					if(value[0]=='?' && value.length > 1)
					{
						trimVal = value.substr(1);
						for(var i=0; i<Glee.reapers.length; i++)
						{
							if(Glee.reapers[i].command == trimVal)
							{
								Glee.initReaper(Glee.reapers[i]);
								break;
							}
						}
					}
					else if(value[0] == ':') //Run a yubnub command
					{
						c = value.substring(1);
						c = c.replace("$", location.href);
						Glee.subText.html("Run yubnub command (press enter to execute): " + c);
						Glee.URL = "http://yubnub.org/parser/parse?command=" + escape(c);
						Glee.subURL.html(Glee.truncate(Glee.URL));
					}
					else if(value[0] == '*')// Any jQuery selector
					{
						Glee.nullMessage = "Nothing found for your selector.";
						Glee.setSubText("Enter jQuery selector and press enter, at your own risk.", "msg");
					}
					else if(value[0] == "!" && value.length > 1) //Searching through page commands
					{
						trimVal = value.substr(1);
						Glee.URL = null;
						for(var i=0; i<Glee.commands.length; i++)
						{
							if(Glee.commands[i].name == trimVal)
							{
								Glee.setSubText(Glee.commands[i].description,"msg");
								Glee.URL = Glee.commands[i];
								break;
							}
						}
						//if command is not found
						if(!Glee.URL)
						{
							//find the closest matching bookmarklet
							Glee.getBookmarklet(trimVal);
						}
					}
					else
					{
						Glee.setSubText("Command not found", "msg");
					}
				}
			}
			else
			{
				//when searchField is empty
				Glee.resetTimer();
				LinkReaper.unreapAllLinks();
				Glee.setSubText(null);
				Glee.selectedElement = null;
				Glee.toggleActivity(0);
			}
			Glee.searchText = value;
		}
		else if(e.keyCode == 9)  //if TAB is pressed
		{
			e.preventDefault();
			if(value != "")
			{
				if(Glee.selectedElement)
				{	
					if(e.shiftKey)
						Glee.selectedElement = LinkReaper.getPrev();
					else
						Glee.selectedElement = LinkReaper.getNext();
					Glee.setSubText(Glee.selectedElement,"el");
					Glee.scrollToElement(Glee.selectedElement);
				}
				else if(Glee.bookmarks)
				{
					if(e.shiftKey)
						Glee.getPrevBookmark();
					else
						Glee.getNextBookmark();
				}
			}
		}
		//if ENTER is pressed
		else if(e.keyCode == 13)
		{
			e.preventDefault();
			if(value[0] == "*")
			{
				if(typeof(Glee.selectedElement) != "undefined" && Glee.selectedElement != null)
					jQuery(Glee.selectedElement).removeClass('GleeHL');
				Glee.reapWhatever(value.substring(1));
				Glee.selectedElement = LinkReaper.getFirst();
				Glee.setSubText(Glee.selectedElement,"el");
				Glee.scrollToElement(Glee.selectedElement);
			}
			else if(value[0] == "!" && value.length > 1)
			{
				//check if it is a command
				//TODO:Glee.URL is misleading here when it actually contains the command or bookmarklet. Fix this
				if(Glee.URL.name != "undefined" && Glee.URL.name)
				{
					Glee.execCommand(Glee.URL);
					return;
				}
				else
				{
					url = Glee.URL.url;
					Glee.setSubText("Executing bookmarklet '"+Glee.URL.title+"'...","msg");
					location.href = url;
				}
			}
			else
			{
				var anythingOnClick = true;
				if(Glee.selectedElement != null && typeof(Glee.selectedElement) != "undefined") //if the element exists
				{
					//check to see if an anchor element is associated with the selected element
					//currently only checking for headers and images
					var a_el = null;
					if (jQuery(Glee.selectedElement)[0].tagName == "A")
						a_el = Glee.selectedElement;
					else if (jQuery(Glee.selectedElement)[0].tagName[0] == "H")
						a_el = jQuery(Glee.selectedElement).find('a');
					else if (jQuery(Glee.selectedElement)[0].tagName == "IMG")
						a_el = jQuery(Glee.selectedElement).parents('a');

					if(a_el) //if an anchor element is associated with the selected element
					{
						//setting the target attribute of element depending upon if shift key was pressed
						if(e.shiftKey)
							target = true;
						else
							target = false;
						//simulating a click on the link
						anythingOnClick = Glee.simulateClick(a_el,target);
						
						//if opening the link on the same page, close the gleeBox
						if(!target)
						{
							setTimeout(function(){
								Glee.searchField.blur();
							},0);
							Glee.closeBoxWithoutBlur();
						}
						return false;
					}
				}
				//if URL is empty or #, same as null
				if(Glee.URL == "#" || Glee.URL == "")
					Glee.URL = null;

				if(Glee.URL)
				{
					//if the URL is relative, make it absolute
					Glee.URL = Glee.makeURLAbsolute(Glee.URL, location.href);
					if(e.shiftKey)
					{
						Glee.openNewTab();
						return false;
					}
					else
					{
						url = Glee.URL;
						Glee.closeBoxWithoutBlur();
						window.location = url;
					}
				}
				else //if it is an input element or text field, set focus to it, else bring back focus to document
				{
					if(typeof(Glee.selectedElement) != "undefined" && Glee.selectedElement)
					{
						if(jQuery(Glee.selectedElement)[0].tagName == "INPUT" || jQuery(Glee.selectedElement)[0].tagName == "TEXTAREA")
						{
							setTimeout(function(){
								Glee.selectedElement.focus();
							},0);
						}
						else
						{
							setTimeout(function(){
								Glee.searchField.blur();
							},0);
						}
					}
					else
					{
						setTimeout(function(){
							Glee.searchField.blur();
						},0)
					}
				}
				setTimeout(function(){
					Glee.closeBoxWithoutBlur();
				},0);
			}
		}
		else if(e.keyCode == 40 || e.keyCode == 38) //when UP/DOWN arrow keys are released
		{
			jQuery('html,body').stop(true);
		}
	});
});

var Glee = {
	searchText:"",
	commandMode: false,
	//used to enable/disable gleeBox (1 = enabled, 0 = disabled)
	status:1, 
	//Currently selected element
	selectedElement:null,
	//current URL where gleeBox should go
	URL:null,
	//element on which the user was focussed before a search
	userFocusBeforeGlee:null,
	//array to store bookmarks, if found for a search
	bookmarks:[],
	//whether bookmark search is enabled/disabled
	bookmarkSearchStatus:false,
	//scrolling Animation speed
	scrollingSpeed:750,
	//position of gleeBox (top,middle,bottom)
	position: "middle",
	//size of gleeBox (small,medium,large)
	size:"large",
	//URLs for which gleeBox should be disabled
	domainsToBlock:[
		"mail.google.com",
		"google.com/reader",
		"wave.google.com"
	],
	// !commands
	commands:[
		{
			name: "tweet",
			method:"Glee.sendTweet",
			domain:"*",
			description:"Tweet this page",
			statusText:"Redirecting to twitter homepage..."
		},
		{
			name: "shorten",
			method:"Glee.shortenURL",
			domain:"*",
			description:"Shorten the URL of this page using bit.ly",
			statusText:"Shortening URL via bit.ly..."
		},
		{
			name: "read",
			method:"Glee.makeReadable",
			domain:"*",
			description:"Make your page readable using Readability",
			statusText:"wait till Glee+Readability work up the magic"
		},
		{
			name: "rss",
			method:"Glee.getRSSLink",
			domain:"*",
			description:"Open the RSS feed of this page in GReader",
			statusText:"Opening feed in Google Reader..."
		},
		{
			name: "help",
			method:"Glee.help",
			domain:"*",
			description:"View user manual",
			statusText:"Loading help page..."
		}
	],
	
	// Reaper Commands

	//We can add methods to the associative array below to support custom actions.
	//It works, I've tried it.
	reapers : [
		{
			command : "?",
			nullMessage : "Could not find any input elements on the page.",
			selector : "input:enabled:not(#gleeSearchField),textarea",
			cssStyle : "GleeReaped"
		},
		{
			command : "img",
			nullMessage : "Could not find any linked images on the page.",
			selector : "a > img",
			cssStyle : "GleeReaped"
		},
		{
			command : "h",
			nullMessage : "Could not find any headings on the page.",
			selector : "h1,h2,h3",
			cssStyle : "GleeReaped"
		},
		{
			command : "p",
			nullMessage : "Could not find any paragraphs on the page.",
			selector: "p",
			cssStyle : "GleeReaped"
		},
		{
			command : "a",
			nullMessage : "No links found on the page",
			selector: "a",
			cssStyle: "GleeReaped"
		}
		],
	initBox: function(){
		// Creating the div to be displayed
		this.searchField = jQuery("<input type=\"text\" id=\"gleeSearchField\" value=\"\" />");
		this.subText = jQuery("<div id=\"gleeSubText\">Nothing selected</div>");
		this.subURL = jQuery("<div id=\"gleeSubURL\"></div>")
		this.searchBox = jQuery("<div id=\"gleeBox\"></div>");
		var subActivity	= jQuery("<div id=\"gleeSubActivity\"></div>")
		var sub = jQuery("<div id=\"gleeSub\"></div>");
		sub.append(this.subText).append(subActivity).append(this.subURL);
		this.searchBox.append(this.searchField).append(sub);
		jQuery(document.body).append(this.searchBox);
		this.getOptions();
		this.initOptions();
	},
	initOptions:function(){
		//setting gleeBox position
		if(Glee.position == "top")
			topSpace = 0;
		else if(Glee.position == "middle")
			topSpace = 35;
		else
			topSpace = 78;
		Glee.searchBox.css("top",topSpace+"%");
		
		//setting gleeBox size
		if(Glee.size == "small")
			fontsize = "30px"
		else if(Glee.size == "medium")
			fontsize = "50px"
		else
			fontsize = "100px"
		Glee.searchField.css("font-size",fontsize);
	},
	closeBox: function(){
		LinkReaper.unreapAllLinks();
		this.getBackInitialState();
		this.searchBox.fadeOut(150);
		this.searchField.attr('value','');
		this.setSubText(null);
		this.selectedElement = null;
	},
	closeBoxWithoutBlur: function(){
		this.searchBox.fadeOut(150);
		LinkReaper.unreapAllLinks();
		//resetting value of searchField
		this.searchField.attr('value','');
		this.setSubText(null);
		this.selectedElement = null;
	},
	initReaper: function(reaper){
		this.nullMessage = reaper.nullMessage;
		LinkReaper.selectedLinks = jQuery(reaper.selector);
		LinkReaper.selectedLinks = jQuery.grep(LinkReaper.selectedLinks, Glee.isVisible);
		this.selectedElement = LinkReaper.getFirst();
		this.setSubText(Glee.selectedElement,"el");
		this.scrollToElement(Glee.selectedElement);	
		jQuery(LinkReaper.selectedLinks).each(function(){
			jQuery(this).addClass(reaper.cssStyle);
		});
		LinkReaper.traversePosition = 0;
		LinkReaper.searchTerm = "";
	},
	setSubText: function(val,type){
		//reset Glee.URL
		this.URL = null;
		if(type == "el") // here val is the element or maybe null if no element is found for a search
		{
			if(val && typeof val!= "undefined")
			{
				jQueryVal = jQuery(val); 
				var isHeading = jQueryVal[0].tagName[0] == "H";
				var isImage = jQueryVal[0].tagName == "IMG";
				var isNotLink = (jQueryVal[0].tagName != "A");
				if(isNotLink) //if it is not a link
				{
					this.subText.html(this.truncate(jQueryVal.text()));
					var a_el = null;
					if(isHeading)
						a_el = jQuery(jQueryVal.find('a'));
					else if(isImage)
						a_el = jQuery(jQueryVal.parents('a'));
						
					if(a_el.length != 0)
					{
						this.URL = a_el.attr("href");
						this.subURL.html(this.truncate(this.URL));
					}
					else
						this.subURL.html("");
				}
				else if(jQueryVal.find("img").length != 0) //it is a link containing an image
				{
					this.URL = jQueryVal.attr("href");
					this.subURL.html(this.truncate(this.URL));
					var title = jQueryVal.attr("title") || jQueryVal.find('img').attr('title');
					if(title != "")
						this.subText.html(this.truncate(title));
					else
						this.subText.html("Linked Image");
				}	
				else //it is a link
				{
					var title = jQueryVal.attr('title');
					var text = jQueryVal.text();

					this.subText.html(this.truncate(text));
					if(title !="" && title != text)
					{
						this.subText.html(this.truncate(this.subText.html()+" -- "+title));
					}
					this.URL = jQueryVal.attr('href');
					this.subURL.html(this.truncate(this.URL));
				}
			}
			else if(Glee.commandMode == true)
			{
				this.subText.html(Glee.nullMessage);
			}
			else //go to URL ,search for bookmarks or google
			{
				var text = this.searchField.attr("value");
				this.selectedElement = null;
				//if it is a URL
				if(this.isURL(text))
				{
					this.subText.html(this.truncate("Go to "+text));
					var regex = new RegExp("((https?|ftp|gopher|telnet|file|notes|ms-help):((//)|(\\\\))+)");
					if(!text.match(regex))
						text = "http://"+text;
					this.URL = text;
					this.subURL.html(this.truncate(text));
				}
				else if(this.bookmarkSearchStatus) //is bookmark search enabled?
				{
					//emptying the bookmarks array
					this.bookmarks.splice(0,Glee.bookmarks.length);
					this.isBookmark(text); //check if the text matches a bookmark
				}
				else //search
					this.setSubText(text,"search");
			}
		}
		else if(type == "bookmark") // here val is the bookmark no. in Glee.bookmarks
		{
			this.subText.html(this.truncate("Open bookmark ("+(val+1)+" of "+(this.bookmarks.length - 1)+"): "+this.bookmarks[val].title));
			this.URL = this.bookmarks[val].url;
			this.subURL.html(this.truncate(this.URL));
		}
		else if(type == "bookmarklet") // here val is the bookmarklet returned
		{
			this.subText.html("Closest matching bookmarklet: "+val.title+" (press enter to execute)");
			this.URL = val;
			this.subURL.html('');
		}
		else if(type == "search") // here val is the text query
		{
			this.subText.html(this.truncate("Google "+val));
			this.URL = "http://www.google.com/search?q="+val;
			this.subURL.html(this.URL);	
		}
		else if(type == "msg") // here val is the message to be displayed
		{
			this.subText.html(val);
			this.subURL.html('');
		}
		else
		{
			this.subText.html("Nothing selected");
			this.subURL.html('');
		}
	},
	getNextBookmark:function(){
		if(this.bookmarks.length > 1)
		{
			if(this.currentResultIndex == this.bookmarks.length-1)
				this.currentResultIndex = 0;
			else
				this.currentResultIndex++;
			//if it is the last, call subText for search
			if(this.currentResultIndex == this.bookmarks.length-1)
				this.setSubText(this.bookmarks[this.currentResultIndex],"search");
			else
				this.setSubText(this.currentResultIndex,"bookmark");
		}
		else
			return null;
	},
	getPrevBookmark:function(){
		if(this.bookmarks.length > 1)
		{
			if(this.currentResultIndex == 0)
				this.currentResultIndex = this.bookmarks.length-1;
			else
				this.currentResultIndex --;
			//if it is the last, call subText for search
			if(this.currentResultIndex == this.bookmarks.length-1)
				this.setSubText(this.bookmarks[this.currentResultIndex],"search");
			else
				this.setSubText(this.currentResultIndex,"bookmark");
		}
		else
			return null;
	},
	scrollToElement: function(el){
		var target;
		if(typeof(el) != "undefined" && el)
		{
			target = jQuery(el);
			if(target.length != 0)
			{
				// We keep the scroll such that the element stays a little away from
				// the top.
				var targetOffset = target.offset().top - 60;
				//stop any previous scrolling to prevent queueing
				jQuery('html,body').stop(true);
				jQuery('html,body').animate({scrollTop:targetOffset},Glee.scrollingSpeed,"linear",Glee.updateUserPosition);
				return false;
			}
		}
	},
	updateUserPosition:function(){
		var value = Glee.searchField.attr("value");
		//Only update the user position if it is a scraping command
		if(value[0] == "?" && value.length > 1)
			Glee.userPosBeforeGlee = window.pageYOffset;
	},
	toggleActivity: function(toggle){
		if(toggle == 1)
			jQuery("#gleeSubActivity").html("searching");
		else
			jQuery("#gleeSubActivity").html("");
	},
	getBackInitialState: function(){
		jQuery('html,body').stop(true);
		if(this.userPosBeforeGlee != window.pageYOffset)
			jQuery('html,body').animate({scrollTop:Glee.userPosBeforeGlee},Glee.scrollingSpeed);
		if(this.userFocusBeforeGlee != null)
			this.userFocusBeforeGlee.focus();
		else
		{
			//wait till the thread is free
			setTimeout(function(){
				Glee.searchField.blur();
			},0);
		}
	},
	simulateScroll: function(val){
		jQuery('html,body').stop(true, true);
		if(val == 1) //scroll up
			window.scrollTo(window.pageXOffset,window.pageYOffset+200);
		else if(val == 0) //scroll down
			window.scrollTo(window.pageXOffset,window.pageYOffset-200);
		this.userPosBeforeGlee = window.pageYOffset;
	},
	simulateClick: function(el,target){
		var evt = document.createEvent("MouseEvents");
		//on Mac, pass target as e.metaKey
		if(navigator.platform.indexOf("Mac") != -1)
			evt.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,target,0,null);
		else //otherwise, pass target as e.ctrlKey	
			evt.initMouseEvent("click",true,true,window,0,0,0,0,0,target,false,false,false,0,null);
		return el[0].dispatchEvent(evt);
	},
	resetTimer: function(){
		if(typeof(this.timer) != "undefined")
			clearTimeout(this.timer);
	},
	makeURLAbsolute: function(link,host){
		//check if its a bookmarklet meant to execute JS
		if(link.indexOf("javascript:") == 0)
			return link;
		//code from http://github.com/stoyan/etc/blob/master/toAbs/absolute.html
		var lparts = link.split('/');
		if (/http:|https:|ftp:/.test(lparts[0])) {
			// already abs, return
			return link;
		}

		var i, hparts = host.split('/');
		if (hparts.length > 3) {
			hparts.pop(); // strip trailing thingie, either scriptname or blank 
		}

		if (lparts[0] === '') { // like "/here/dude.png"
			host = hparts[0] + '//' + hparts[2];
			hparts = host.split('/'); // re-split host parts from scheme and domain only
	        delete lparts[0];
		}

		for(i = 0; i < lparts.length; i++) {
			if (lparts[i] === '..') {
				// remove the previous dir level, if exists
				if (typeof lparts[i - 1] !== 'undefined') { 
					delete lparts[i - 1];
				} 
				else if (hparts.length > 3) { // at least leave scheme and domain
					hparts.pop(); // stip one dir off the host for each /../
				}
				delete lparts[i];
			}
			if(lparts[i] === '.') {
				delete lparts[i];
			}
		}

		// remove deleted
		var newlinkparts = [];
		for (i = 0; i < lparts.length; i++) {
			if (typeof lparts[i] !== 'undefined') {
				newlinkparts[newlinkparts.length] = lparts[i];
			}
		}

		return hparts.join('/') + '/' + newlinkparts.join('/');
	},
	truncate:function(text){
		if(text && typeof(text) != "undefined")
		{
			if(text.length > 80)
				return text.substr(0,78)+"...";
			else
				return text;
		}
	},
	isURL:function(url){
		var regex = new RegExp("(\\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk|in))");
		return url.match(regex);
	},
	checkDomain:function(){
		for(var i=0; i<Glee.domainsToBlock.length; i++)
		{
			if(location.href.indexOf(Glee.domainsToBlock[i]) != -1)
			{
				Glee.status = 0;
				break;
			}
		}
	},
	isVisible:function(el){
		el = jQuery(el);
		if(el.css('display') == "none" || el.css('visibility') == "hidden")
			return false;
		else
		{
			// TODO: A more efficient way needed, but is there one?
			var parents = el.parents();
			for(var i=0;i<parents.length;i++)
			{
				if(jQuery(parents[i]).css("display") == "none")
					return false;
			}
		}
		return true;
	},
	reapWhatever: function(selector){
		LinkReaper.selectedLinks = jQuery(selector);
		LinkReaper.selectedLinks.each(function(){
			jQuery(this).addClass('GleeReaped');
		});
		LinkReaper.selectedLinks = jQuery.grep(LinkReaper.selectedLinks, Glee.isVisible);
		this.traversePosition = 0;
		LinkReaper.searchTerm = "";
	},
	execCommand: function(command){
		//call the method
		//not sure if eval is the way to go here
		var method = command.method+"()";
		//setting the status
		this.setSubText(command.statusText,"msg");
		eval(method);
	},
	makeReadable: function(){
		//code from the Readability bookmarklet (http://lab.arc90.com/experiments/readability/)
		location.href = "javascript:(function(){readStyle='style-newspaper';readSize='size-large';readMargin='margin-wide';_readability_script=document.createElement('SCRIPT');_readability_script.type='text/javascript';_readability_script.src='http://lab.arc90.com/experiments/readability/js/readability.js?x='+(Math.random());document.getElementsByTagName('head')[0].appendChild(_readability_script);_readability_css=document.createElement('LINK');_readability_css.rel='stylesheet';_readability_css.href='http://lab.arc90.com/experiments/readability/css/readability.css';_readability_css.type='text/css';_readability_css.media='screen';document.getElementsByTagName('head')[0].appendChild(_readability_css);_readability_print_css=document.createElement('LINK');_readability_print_css.rel='stylesheet';_readability_print_css.href='http://lab.arc90.com/experiments/readability/css/readability-print.css';_readability_print_css.media='print';_readability_print_css.type='text/css';document.getElementsByTagName('head')[0].appendChild(_readability_print_css);})();";
	},
	
	shortenURL: function(){
		this.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+escape(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
		function(data){
			var json = JSON.parse("["+data+"]");
			var shortenedURL = json[0].results[location.href].shortUrl;
			Glee.searchField.attr("value",shortenedURL);
			Glee.setSubText("You can now copy the shortened URL to your clipboard!","msg");
		});
	},
	
	sendTweet: function(){
		//if the url is longer than 30 characters, send request to bitly to get the shortened URL
		var url = location.href;
		if(url.length > 30)
		{
			this.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+escape(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
			function(data){
				var json = JSON.parse("["+data+"]");
				var shortenedURL = json[0].results[location.href].shortUrl;
				var encodedURL = escape(shortenedURL);
				//redirect to twitter homepage
				location.href = "http://twitter.com/?status="+encodedURL;
			});
		}
		else
		{
			//redirect to twitter without shortening the URL
			var encodedURL = escape(location.href);
			location.href =  "http://twitter.com/?status="+encodedURL;
		}
	},
	getRSSLink:function(){
		//code via bookmark for google reader
 		 var b=document.body;var GR________bookmarklet_domain='http://www.google.com';if(b&&!document.xmlVersion){void(z=document.createElement('script'));void(z.src='http://www.google.com/reader/ui/subscribe-bookmarklet.js');void(b.appendChild(z));}else{location='http://www.google.com/reader/view/feed/'+encodeURIComponent(location.href)}
	},
	help: function(){
		// TODO: When we make commands scalable, maybe we can make this load as a div
		// on the page. In case we do that, should find a way to not make the content
		// redundant.
		window.location = "http://thegleebox.com/manual.html";
	}
}

var LinkReaper = {
	
	searchTerm: "",
	selectedLinks: [],
	traversePosition: 0,
	
	reapAllLinks:function(){
		this.selectedLinks = jQuery("a");
		//get rid of the hidden links
		this.selectedLinks = jQuery.grep(this.selectedLinks, Glee.isVisible);
		//get rid of the linked images. we only want textual links
		var hasImage = function(el){
			return (jQuery(el).find('img').length == 0);
		};
		this.selectedLinks = jQuery(jQuery.grep(this.selectedLinks,hasImage));
		this.selectedLinks.each(function(){
			jQuery(this).addClass('GleeReaped');
		});
		this.traversePosition = 0;
		//can't figure out what value to set of searchTerm here
		LinkReaper.searchTerm = "";
	},
	
	reapLinks: function(term) {
		if((term != "") && (LinkReaper.searchTerm != term))
		{
			// If this term is a specialization of the last term
			if((term.indexOf(LinkReaper.searchTerm) == 0) &&
			(LinkReaper.searchTerm != ""))
			{
				jQuery(LinkReaper.selectedLinks).each(function(){
					if(!LinkReaper.reapALink(jQuery(this), term))
					{
						LinkReaper.unreapLink(jQuery(this));
					}
				});
			}
			// Else search the whole page
			else
			{
				newList = [];
				jQuery('a').each(function(){
					if(!LinkReaper.reapALink(jQuery(this), term))
					{
						LinkReaper.unreapLink(jQuery(this));
					}
					else
					{
						newList.push(jQuery(this));
					}
				});
				LinkReaper.selectedLinks = newList;
			}
			LinkReaper.searchTerm = term;
			this.traversePosition = 0;
		}
	},
	
	reapALink: function(el, term) {
		var index = el.text().toLowerCase().indexOf(term.toLowerCase());
		if(index != -1 && Glee.isVisible(el)) {
			el.addClass('GleeReaped');
			Glee.setSubText(el,"el");
			return true;
		}
		else {
			return false;
		}
	},
	
	unreapLink: function(el) {
		// TODO: What if there are multiple links with different names and same URL?
		var isNotEqual = function(element){
			element = jQuery(element);
			if(element.attr('href') == el.attr('href') )
				return false;
			else
				return true;
		};
		this.selectedLinks = this.selectedLinks.filter(isNotEqual);
		el.removeClass('GleeReaped').removeClass('GleeHL');
	},
	
	unreapAllLinks: function() {
		jQuery(this.selectedLinks).each(function(){
			jQuery(this).removeClass('GleeReaped').removeClass('GleeHL');
		});
		
		// TODO: Isn't there a better way to empty an array?
		this.selectedLinks.splice(0,LinkReaper.selectedLinks.length);
		this.searchTerm = "";
		this.traversePosition = 0;
	},
	
	getNext: function(){
		if(this.selectedLinks.length == 0)
			return null;
		else if(this.traversePosition < this.selectedLinks.length - 1)
		{
			this.unHighlight(jQuery(this.selectedLinks[this.traversePosition]));
			var hlItem = this.selectedLinks[++this.traversePosition];
			this.highlight(jQuery(hlItem));
			return jQuery(hlItem);
		}
		else
		{
			//Un-highlight the last item. This might be a loopback.
			this.unHighlight(jQuery(this.selectedLinks[this.selectedLinks.length - 1]));
			this.traversePosition = 0;
			this.highlight(jQuery(this.selectedLinks[0]));
			return jQuery(this.selectedLinks[0]);	
		}
		
	},
	
	getPrev: function(){
		if(this.selectedLinks.length == 0)
			return null;
		else if(this.traversePosition > 0)
		{
			this.unHighlight(jQuery(this.selectedLinks[this.traversePosition]));
			var hlItem = this.selectedLinks[--this.traversePosition];
			this.highlight(jQuery(hlItem));
			return jQuery(hlItem);
		}
		else
		{
			//Un-highlight the first item. This might be a reverse loopback.
			this.unHighlight(jQuery(this.selectedLinks[0]));
			this.traversePosition = this.selectedLinks.length - 1;
			this.highlight(jQuery(this.selectedLinks[this.selectedLinks.length - 1]));
			return jQuery(this.selectedLinks[this.selectedLinks.length - 1]);
		}
		
	},
	
	getFirst: function(){
		this.highlight(jQuery(this.selectedLinks[0]));
		this.traversePosition = 0;
		return this.selectedLinks[0];
	},
	
	highlight: function(el){
		el.removeClass("GleeReaped");
		el.addClass("GleeHL");
	},
	
	unHighlight: function(el){
		el.removeClass("GleeHL");
		el.addClass("GleeReaped");
	}
}