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
          	var scriptObj = runtime.getCurrentScript();
			var exeContext = scriptObj.getParameter({
				name: 'custscript_trigger_context'
			});
          	log.error(title, 'scriptContext.type: ' + scriptContext.type);
          
			var newRecord = scriptContext.newRecord;
			var recordObj = new Object();
			recordObj.department = newRecord.getValue('department');
			recordObj.total = newRecord.getValue('total');
			recordObj.date = newRecord.getText('trandate');
			recordObj.lvl = newRecord.getValue('custbody_nappjo_next_approval_lvl');
			
			log.error(title, 'auto Approved?: ' + _lib_approvals._hasAutoApproval(recordObj));
			
			return _lib_approvals._hasAutoApproval(recordObj);
            
		} catch (error) {
			log.error(title, 'error: ' + JSON.stringify(error));
		}
	}

	function isEmpty(str) {
		if (str == '' || str == null || str == undefined || str == 'undefined') return true;
		return false;
	}

	function getDelegation(empId) {
		var title = "getDelegation";
		var delegationEmp = null;
		var employeeSearchObj = search.create({
			type: "employee",
			filters: [
				["internalidnumber", "equalto", empId], "AND",
				["custentity_delegate_approver", "noneof", "@NONE@"], "AND",
				["formulanumeric: {today}-{custentity_delegation_from}", "greaterthanorequalto", "0"], "AND",
				["formulanumeric: {today}-{custentity_delegation_to}", "lessthanorequalto", "0"], "AND",
				["custentity_delegate_approver.isinactive", "is", "F"]
			],
			columns: [
				search.createColumn({
					name: "entityid",
					sort: search.Sort.ASC,
					label: "Name"
				}),
				search.createColumn({
					name: "custentity_delegate_approver",
					label: "Delegate Approver"
				}),
			]
		});
		var searchResultCount = employeeSearchObj.runPaged().count;
		log.debug("employeeSearchObj result count", searchResultCount);
		employeeSearchObj.run().each(function(result) {
			delegationEmp = result.getValue('custentity_delegate_approver');
		});
		log.error(title, 'delegationEmp: ' + delegationEmp);
		return delegationEmp;
	}
	return {
		onAction: onAction
	};
});