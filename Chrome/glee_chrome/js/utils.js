/**
 *	Utility methods used in Glee
 */
var Utils = {
	/**
	 * 	Checks for a valid URL
	 * 	@param {String} url String to be checked as a valid URL
	 * 	@return {boolean} True if valid URL
	 */
	isURL: function(url) {
		var regex = new RegExp("(\\.(ac|ad|ae|aero|af|ag|ai|al|am|an|ao|aq|ar|arpa|as|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|com|coop|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|info|int|io|iq|ir|is|it|je|jm|jo|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mo|mobi|mp|mq|mr|ms|mt|mu|museum|mv|mw|mx|my|mz|na|name|nc|ne|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw))");
		return (url.match(regex) === null) ? false : true;
	},
	
	/**
	 * 	Converts a relative URL into absolute format
	 * 	@param {String} link The url string
	 * 	@param {String} host Host string
	 * 	@return {String} The converted URL
	 */
	makeURLAbsolute: function(link, host) {
		// if it is a bookmarklet, return as it is
		if (link.indexOf("javascript:") === 0)
			return link;
		
		// from http://github.com/stoyan/etc/blob/master/toAbs/absolute.html
		var lparts = link.split('/');
		if (/http:|https:|ftp:/.test(lparts[0])) {
			// already abs, return
			return link;
		}
		if (link.indexOf("#") == 0) {
			// link is an anchor link
			var hparts = host.split('#');
			return hparts[0] + link;
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

		for (i = 0; i < lparts.length; i++) {
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
			if (lparts[i] === '.') {
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
	
	/**
	 *	- Replaces < and > with their HTML character entities
	 * 	- If the string is long, cut it off with ...
	 * 	@param {String} text The string to operate on
	 * 	@return {String} The filtered text
	 */
	filter: function(text) {
		if (text && typeof(text) != "undefined")
		{
			// replace < with &lt; and > with &gt;
			text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			if (text.length > 75)
				return text.substr(0, 73) + "...";
			else
				return text;
		}
	},
	
	/**
	 *	Check if the current URL belongs to the list of disabled URLs. TODO: Does not belong here.
	 *	@return {Integer} Returns 0 if yes. Else, 1.
	 */
	checkDomain: function() {
	    var len = Glee.domainsToBlock.length;
		for (var i = 0; i < len; i++)
		{
			if (location.href.indexOf(Glee.domainsToBlock[i]) != -1)
				return 0;
		}
		return 1;
	},
	
	/**
	 * 	Checks if a DOM element and its parents are currently visible
	 * 	@param {Element} el DOM element to check
	 * 	@return {boolean} If the element is visible, returns true.
	 */
	isVisible: function(el) {
		var $el = $(el);
		if ($el.css('display') === "none" || $el.css('visibility') === "hidden")
			return false;
		else
		{
			var $parents = $el.parents();
			var len = $parents.length;
			
			for (var i = 0; i < len; i++)
			{
				if ($($parents[i]).css("display") === "none")
					return false;
			}
		}
		return true;
	},
	
	/**
	 *	Simulates a click on an element. TODO: el should be DOM element here
	 * 	@param {jQuery} el jQuery object of DOM element to simulate click upon
	 *	@param {boolean} Set to true if the link should be opened in a new tab
	 * 	@return {Event} The Click event
	 */
	simulateClick: function(el, target) {
		var evt = document.createEvent("MouseEvents");
		// on Mac, pass target as e.metaKey
		if (navigator.platform.indexOf("Mac") != -1)
			evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, target, 0, null);
		else // otherwise, pass target as e.ctrlKey	
			evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, target, false, false, false, 0, null);
		return el[0].dispatchEvent(evt);
	},
	
	/**
	 *	Start/stop scrolling
	 * 	@param {Integer} val If set to 0, scrolling is stopped. Else, it determines whether to scroll upward/downward
	 */
	simulateScroll: function(val) {
		if (val == 0) {
			Glee.cache.jBody.stop(true);
			Glee.scrollState = 0;
		}
		else if (Glee.scrollState == 0) {
			Glee.scrollState = val;
            Utils.infiniteScroll();
		}
	},
	
	/**
	 *	Set page into infinite scrolling mode
	 */
	infiniteScroll: function() {
		if (Glee.scrollState < 0) {
			loc = $(document).height();
			duration = 2 * (loc - window.pageYOffset) / Glee.defaults.pageScrollSpeed;
		}
		else {
			loc = 0;
			duration = 2 * (window.pageYOffset / Glee.defaults.pageScrollSpeed);
		}
		Glee.cache.jBody.animate(
			{ scrollTop: loc },
			duration);
	},
	
	/**
	 *	Selects all text in a textfield
	 *	@param {Element} el Textfield whose text is to be selected
	 * 	@return {boolean} If not a valid element or textfield is empty, returns false. Else, true.
	 */
	selectAllText: function(el) {
        if (!el || !el.value || el.value === "")
            return false;
        var len = el.value.length;
        el.setSelectionRange(0, len);
        return true;
    },
    
	/**
	 *	Make text editable in place. Replaces text with textfield for editing.
	 *	@param {Element} el Element which contains the text
	 *	@param {Function} callback Function to be called when user finishes editing
	 *	@param {Object} options Options for edit in place field
	 * 	@return {true}
	 */
    makeEditable: function(el, callback, options) {
        el.bind('click keyup', {callback: callback}, function(e) {
            if (e.type == 'keyup' && e.keyCode != 13)
                return true;

            var el = $(this);
            el.hide();
            
            var elWidth;
            if (options && options.fixedWidth)
                elWidth = options.fixedWidth;
            else 
                elWidth = el.width();
            var fontSize = el.css('font-size');
            var fontFamily = el.css('font-family');
            var value = el.text();
            // create a textfield
            var input = $('<input>', {
                type: 'text',
                value: value,
                id: 'gleebox-editing-field'
            })
            .width(elWidth)
            .css({
                'font-family': fontFamily,
                'font-size': fontSize
            });
            
            el.before(input);
            input.focus();

            // if selectText is set to true, select all text in input field
            if (options && options.selectText)
                input.get(0).setSelectionRange(0, value.length);

            var onClose = function(e) {
                if (e.type == "keyup" && e.keyCode != 13 && e.keyCode != 27)
                    return true;
                if (e.type == "mousedown" && e.target.id == e.data.input.attr('id'))
                    return true;
                var value = e.data.input.attr('value');
                e.data.input.remove();
                if (value == "")
                    value = e.data.el.html();
                e.data.el.html(value);
                e.data.el.show();
                e.data.callback(value);
                $(document).unbind("mousedown", onClose);
                $(document).unbind("keyup", onClose);
            }
            
            input.bind('keyup', {input: input, el: el, callback: callback}, onClose);
            $(document).bind('mousedown',{input: input, el: el, callback: callback}, onClose);
        });
		return true;
    }
};