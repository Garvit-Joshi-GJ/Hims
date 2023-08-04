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
			//get already approved users
			var alreadyApprovedByUsers = (scriptContext.type == 'create') ? [] : _lib_approvals._getAlreadyApprovedByUsers(newRecord.id);
			log.error(title, 'alreadyApprovedByUsers: ' + JSON.stringify(alreadyApprovedByUsers));
			var nextApproverObj = _lib_approvals._nextApprover(recordObj, alreadyApprovedByUsers);
			var nextApprover = nextApproverObj.next_approver;
			var nextApproverLvl = nextApproverObj.next_lvl;
			log.error(title, 'nextApproverObj: ' + JSON.stringify(nextApproverObj));
			
			/*if (!isEmpty(nextApprover)) {
				var delegateEmp = getDelegation(nextApprover);
				if (!isEmpty(delegateEmp)) {
					nextApprover = delegateEmp;
				}
			}
			var autoApprovalLvls = nextApproverObj.autoApproveLvls;
			log.error(title, 'autoApprovalLvls: ' + autoApprovalLvls);
			//Create Trial For Auto Approval 
			for (var t = 0; t < autoApprovalLvls.length; t++) {
				var approvalTrialecRordObj = new Object();
				approvalTrialecRordObj.custrecord_app_trial_action_taken = "Auto-approved";
				approvalTrialecRordObj.custrecord_app_trial_app_state = autoApprovalLvls[t];
				approvalTrialecRordObj.custrecord_app_trial_app_status = "2";
				approvalTrialecRordObj.custrecord_app_trial_approver = "";
				approvalTrialecRordObj.custrecord_app_trial_original_approver = nextApproverObj.autoApprover;
				approvalTrialecRordObj.custrecord_app_trial_role = "";
				approvalTrialecRordObj.custrecord_app_trial_tran_no = newRecord.id;
				approvalTrialecRordObj.custrecord_app_trial_action_context = ""
				approvalTrialecRordObj.custrecord_app_trial_comments = "";
				var approvalTrial = _lib_approvals._createApprovalTrial(approvalTrialecRordObj);
				log.error(title, 'approvalTrial: ' + approvalTrial);
			}
			*/

			log.error(title, 'nextApproverObj: ' + JSON.stringify(nextApproverObj));
			

          	log.error(title, 'exeContext: ' + exeContext);
          	if(exeContext === 'UPDATE_FIELD'){
              newRecord.setValue('custbody_nappjo_next_approval_lvl',nextApproverLvl);
              //newRecord.setValue('nextapprover',nextApprover);
              newRecord.setValue('custbody_nappjo_next_approver',nextApprover);
              
            }else{
            	var id = record.submitFields({
                  type: newRecord.type,
                  id: newRecord.id,
                  values: {
                      custbody_nappjo_next_approval_lvl: nextApproverLvl,
                      //nextapprover: nextApprover,
                      custbody_nappjo_next_approver: nextApprover
                  },
                  options: {
                      enableSourcing: false,
                      ignoreMandatoryFields: true
                  }
              }); 
            }
            
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