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
			var totalAmount = recordObj.getValue('total');;
			var rate = currency.exchangeRate({
				source: currencyId,
				target: 'USD',
				date: recordObj.getValue('trandate')
			});

			var usdAmount = totalAmount * rate;
			
			/*var id = record.submitFields({
				type: recordObj.type,
				id: recordObj.id,
				values: {
					custbody_nappjo_tran_amount_usd: parseFloat(usdAmount).toFixed(2)
				},
				options: {
					enableSourcing: false,
					ignoreMandatoryFields : true
				}
			});*/
			
			return parseFloat(usdAmount).toFixed(2)
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