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
			var userObj = runtime.getCurrentUser();
			log.error(title, 'runtime.executionContext: ' + runtime.executionContext);
			log.error(title, 'runtime.ContextType: ' + JSON.stringify(runtime.ContextType));
			
			var recordRec = scriptContext.newRecord;
			var recordObj = new Object();
			recordObj.custrecord_app_trial_action_taken = "Approved";
			recordObj.custrecord_app_trial_app_state = recordRec.getText('custbody_nappjo_next_approval_lvl');
			recordObj.custrecord_app_trial_app_status = "2";
			recordObj.custrecord_app_trial_approver = userObj.id//;(runtime.executionContext !== runtime.ContextType.EMAIL_CAPTURE || runtime.executionContext == 'emailcapture') ? recordRec.getValue('custbody_nappjo_next_approver') : userObj.id;
			//recordObj.custrecord_app_trial_original_approver = recordRec.getValue('custbody_nappjo_next_approver');
			recordObj.custrecordapp_trial_original_approvers = recordRec.getValue('custbody_nappjo_next_approver');
			recordObj.custrecord_app_trial_role = userObj.role;
			recordObj.custrecord_app_trial_tran_no = recordRec.id;
          	recordObj.custrecord_app_trial_action_context = recordRec.getValue('custbody_email_capture_action') ? "Email":"UI"//runtime.executionContext;
          	recordObj.custrecord_app_trial_comments = recordRec.getValue('custbody_nappjo_app_comments');
          
			 
			var approvalTrial = _lib_approvals._createApprovalTrial(recordObj);
			log.error(title, 'approvalTrial: ' + approvalTrial);
			
           //unmark Email capture
         /* var updatefields = record.submitFields({
              type: 'purchaseorder',
              id: recordRec.id,
              values: {
                  'custbody_email_capture_action': 'F'
              }
          });
          */

			//return nextApprover;
		//recordRec.setValue('custbody_email_capture_action', false);

			
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