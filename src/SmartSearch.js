class SmartSearch extends CommonComponent {
	
	constructor(elTarget, htOption) {
		super(htOption)
		this.elTarget = elTarget;
		this.init(htOption);
	}

	//TODO. think about moving super class.
	init(htOption) {
		this._setDefaultOption();
		//option variable declaration
		this.option = {};
		super.execOption(htOption, this._htDefaultOption, this.option);
		this._setInitValue();
		this._registerEvents();
	}

	_setInitValue() {
		const _cssSelector = {
			inputFieldWrap 		: ".inputWrap",
			inputField 			: ".input-field",
			autoCompleteWrap 	: ".auto-complete-wrap",
			closeLayer 			: ".closeLayer",
			clearQueryBtn 		: ".clearQuery"
		} 

		this.elInputFieldWrap		= this.elTarget.querySelector(_cssSelector.inputFieldWrap);
		this.elInputField 			= this.elTarget.querySelector(_cssSelector.inputField);
		this.elAutoCompleteLayer 	= this.elTarget.querySelector(_cssSelector.autoCompleteWrap);
		this.elCloseButton 			= this.elAutoCompleteLayer.querySelector(_cssSelector.closeLayer);
		this.elClearQueryBtn 		= this.elTarget.querySelector(_cssSelector.clearQueryBtn);
		this.htCachedData 			= {};

		//plugins
		this.aPluginList			= ['RecentWordPlugin'];
		this.htPluginInstance 		= {};

	}

	_setDefaultOption () {
		this._htDefaultOption = {
			//'bCircular' : false,
		}
	}

	_setDefaultFunction() {
		this._htDefaultFunction = {
			'fnInsertAutoCompleteWord' : function(){},
		}
	}

	_registerEvents() {
		this.elInputFieldWrap.addEventListener("touchend", (evt) => this.handlerInputWrap(evt));
		//this.elInputField.addEventListener("focus" , 	(evt) => this.handlerInputFocus(evt));
		this.elInputField.addEventListener("keypress", 	(evt) => this.handlerInputKeyPress(evt));
		this.elInputField.addEventListener("keydown", 	(evt) => this.handlerInputKeydown(evt));
		this.elInputField.addEventListener("input", 	(evt) => this.handlerInputKeyInput(evt));
		this.elCloseButton.addEventListener("touchend", (evt) => this.handlerCloseLayer(evt));
		this.elClearQueryBtn.addEventListener("touchend", (evt) => this.handlerClearInputValue(evt));
	}


	registerCallback(htFn) {
		this.htFn = {};
 		this._setDefaultFunction();
		super.execOption(htFn, this._htDefaultFunction, this.htFn);
	}

	registerAutoCompleteData(htRequestOption) {
		this.htRequestOption = htRequestOption;
	} 

	handlerInputWrap(evt) {
		this.execAfterFocus(evt);
		this.elInputField.focus();
	}

	//deprecated. to move handlerInputWrap method.
	/*
	handlerInputFocus(evt) {
		this.execAfterFocus(evt);
	}
	*/

	//입력필드에 들어가는 값의 어떠한 처리가 필요할때 여기서 처리한다.
	handlerInputKeyPress(evt) {}
	
	//특수키(keycode 8인 backspace등) 작업 조정이 필요한 경우 여기서 처리.
	handlerInputKeydown(evt) {}

	handlerInputKeyInput(evt) {
		let sInputData = this.elInputField.value;
		console.log("input evet fired : ", sInputData);

		if(sInputData.length > 0 ) _cu.setCSS(this.elClearQueryBtn, "display", "inline-block");
		else _cu.closeLayer(this.elClearQueryBtn);

		//after input word, must hide a recent word layer
		let oRecentWordPlugin = this.htPluginInstance["RecentWordPlugin"];
		if(oRecentWordPlugin) _cu.closeLayer(oRecentWordPlugin.elRecentWordLayer);

		if (typeof this.htCachedData[sInputData] === "undefined") this._AutoCompleteRequestManager(sInputData);
		else this._AutoCompleteRequestManager(sInputData, this.htCachedData[sInputData]);
	}

	handlerClearInputValue(evt) {
		this.elInputField.value = "";
		this.handlerCloseLayer();
		_cu.closeLayer(this.elClearQueryBtn);
	}
	
	handlerCloseLayer(evt) {
		_cu.closeLayer(this.elAutoCompleteLayer);
	}

	execAfterFocus(evt) {
		//execute RecentWordPlugin.
		let oRecentWordPlugin = this.htPluginInstance["RecentWordPlugin"];
		if(!oRecentWordPlugin) return;
		oRecentWordPlugin.showRecentSearchWord(this.htFn.fnInsertRecentSearchWord);
	}

	execAfterAutoCompleteAjax(sQuery, sResult) {
		this.htFn.fnInsertAutoCompleteWord(sResult);
		if(this.elAutoCompleteLayer.querySelector("li") !== null) _cu.showLayer(this.elAutoCompleteLayer);
		else _cu.closeLayer(this.elAutoCompleteLayer);

		//save history
		this.htCachedData[sQuery] = sResult;
	}

	_AutoCompleteRequestManager(sQuery) {
		let type = this.htRequestOption.requestType;
		switch(type) {
			case 'jsonp':
				this._makeAutoCompleteJSONPRequest(sQuery, this.htRequestOption.sAutoCompleteURL);
				break;
			case 'ajax':
				this._makeAutoCompleteAjaxRequest(sQuery, this.htRequestOption.sAutoCompleteURL);
				break;
			default: 
				//do something..
		}
	}

	_makeAutoCompleteJSONPRequest(sQuery, sURL) {
		_cu.sendSimpleJSONP(sURL, sQuery, "completion", this.execAfterAutoCompleteAjax.bind(this,sQuery));
	}

	_makeAutoCompleteAjaxRequest(sQuery, sURL) {
		// hardcoded url for test.
		let url = "../jsonMock/"+ sQuery +".json";
		let aHeaders = [["Content-Type", "application/json"]];
		_cu.sendSimpleAjax(url, this.execAfterAutoCompleteAjax.bind(this, sQuery), 
			JSON.stringify({
				sQuery : sQuery,
				nTime : Date.now() 
			}), 
		"get", aHeaders, sQuery);
	}

	addOnPlugin(fnName) {
		return this._addOnPlugin(fnName, this.htPluginInstance, this.aPluginList, this.elTarget);
	}

}
