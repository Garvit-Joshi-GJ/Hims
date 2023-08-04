/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * @NAmdConfig  ./PATHS_approvals.json
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/record', 'N/runtime', 'N/url', 'N/https', 'N/file', 'N/render', 'N/format', 'N/search', 'lib_operations'], function(email, record, runtime, url, https, file, render, format, search, _lib_approvals) {
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
			var newRecord = scriptContext.newRecord;
			var recordObj = new Object();
			recordObj.department = newRecord.getValue('department');
			recordObj.total = newRecord.getValue('total');
			recordObj.date = newRecord.getText('trandate');
			recordObj.lvl = newRecord.getValue('custbody_nappjo_next_approval_lvl');
			var nextApproverObj = _lib_approvals._nextApprover(recordObj,[]);
			var nextApproverAvailable = (nextApproverObj.is_approver_available == true) ? 'T' : 'F';
			
			log.error(title, 'nextApproverObj: ' + JSON.stringify(nextApproverObj));
			
			/*var updateflds = {};
			if(!nextApproverAvailable){
				//updateflds.custbody_nappjo_approver_not_available = '<p style="color:red">APPROVER_RULE_NOT_AVAILABLE</p>';
				updateflds.custbody_nappjo_approval_required = false;
				
			}else{
				
				updateflds.custbody_nappjo_approval_required = true;
			}
			//return nextApprover;
			var id = record.submitFields({
					type: newRecord.type,
					id: newRecord.id,
					values: updateflds,
					options: {
						enableSourcing: false,
						ignoreMandatoryFields : true
					}
				});
			*/
			return nextApproverAvailable;
			
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