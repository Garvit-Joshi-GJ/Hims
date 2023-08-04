/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * @NAmdConfig  ./PATHS_approvals.json
 * @NModuleScope SameAccount
 */
define(['N/runtime','N/currency','N/record'], function(runtime, currency, record) {
	/**
	 * Definition of the Suitelet script trigger point.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @Since 2016.1
	 */
	function onAction(scriptContext) {
		var title = "onAction";
		try {
			var userObj = runtime.getCurrentUser();
			var recordObj = scriptContext.newRecord;
			var currencyId = recordObj.getValue('currency');
			var totalAmount = parseFloat(recordObj.getValue('total')) || 0;
			var originalTotalAmount = parseFloat(recordObj.getValue('custbody_nappjo_tran_amount_usd')) || 0;
			
			var rate = currency.exchangeRate({
				source: currencyId,
				target: 'USD',
				date: recordObj.getValue('trandate')
			});

			var usdCurrentAmount = totalAmount * rate;
            log.debug(title, "usdCurrentAmount: "+usdCurrentAmount+", originalTotalAmount: "+originalTotalAmount)
			var retValue = (usdCurrentAmount > originalTotalAmount) ? 'T' : 'F';
            //(parseFloat(usdCurrentAmount).toFixed(2) > parseFloat(originalTotalAmount).toFixed(2)) ? 'T' : 'F';
			log.debug(title, "retValue: "+retValue);
            return retValue;
		}catch (error) {
			log.error(title, 'error: ' + JSON.stringify(error));
		}
	}

	function isEmpty(str) {
		if (str == '' || str == null || str == undefined || str == 'undefined') return true;
		return false;
	}
	return {
		onAction: onAction
	};
});