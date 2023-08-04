/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/workflow', 'N/search', 'N/record'],
    function(ui, email, runtime, workflow, search, record) {

        var WORKFLOWID = 'customworkflow_nappjo_req_approval';

        function onRequest(context) {
            if (context.request.method === 'GET') {

                var title = "GET";
				
				try{
					var scriptObj = runtime.getCurrentScript();
				
					var request = context.request;

					//Reject or Approve status sent from the client script
					var statusVal = request.parameters.status;
					
					switch(statusVal){
						
						case "SubmitForApproval":
						case "Approve":
						case "Recall":
							break;
						
						case "Reject":
						 //Continue for a Reject 
					var form = ui.createForm({
						title: 'Please enter rejection reason'
					});

					//Reason Field
					var reasonFld = form.addField({
						id: 'custpage_rejection_reason',
						type: ui.FieldType.LONGTEXT,
						label: 'Rejection Comments'
					});
					reasonFld.layoutType = ui.FieldLayoutType.NORMAL;
					reasonFld.breakType = ui.FieldBreakType.STARROW;
					reasonFld.isMandatory = true;

					//Transaction field: will helpful to update transaction
					var tranIdFld = form.addField({
						id: 'custpage_tran_id',
						type: ui.FieldType.SELECT,
						label: 'Transaction#',
						source: 'transaction'
					});
					tranIdFld.defaultValue = request.parameters.tranid;
					tranIdFld.updateDisplayType({
						displayType: ui.FieldDisplayType.INLINE
					});

					//record type
					var recTypeFld = form.addField({
						id: 'custpage_tran_rec_type',
						type: ui.FieldType.TEXT,
						label: 'Record Type'
					});
					recTypeFld.defaultValue = request.parameters.rectype;
					recTypeFld.updateDisplayType({
						displayType: ui.FieldDisplayType.HIDDEN
					});
					
					//client script path
					form.clientScriptModulePath = './_nappjo_cli_po_approvals.js';

					form.addSubmitButton({
						label: 'Submit'
					});

					form.addButton({
						id: 'cancel_btn',
						label: 'Cancel',
						functionName: 'closeWindow'
					});
					context.response.writePage(form);
							
							break;
						
					}
				}catch(error){
					log.audit(title, 'error: ' + JSON.stringify(error));
				}
                
				
                
               
            } else {

                var title = "POST";
                
                var action = "reject";
                
				try{
					var request = context.request;
                
					var rejectionReason = request.parameters.custpage_rejection_reason;
					
					var tranInternalId = request.parameters.custpage_tran_id;
					log.debug(title, 'tranInternalId: ' + tranInternalId);
					
					var scriptObj = runtime.getCurrentScript();
					
					var wfID = scriptObj.getParameter({
						name: 'custscript_app_wf_id'
					});
					
					var wfActions = JSON.parse((scriptObj.getParameter({
						name: 'custscript_rej_action_json'
					})));
					log.debug(title, 'wfActions: ' + JSON.stringify(wfActions))
					
					var wfAction = wfActions.action;
					var wfState = wfActions.state;

					
					var otherId = record.submitFields({
						type: request.parameters.custpage_tran_rec_type,
						id: tranInternalId,
						values: {
							custbody_nappjo_app_comments: rejectionReason
						}
					});
					
					log.audit(title, 'tranInternalId:' + tranInternalId + ' | wfID: ' + wfID + ' | wfAction: ' + wfAction + ' | wfState: ' + wfState)
					
					var workflowInstanceId = workflow.trigger({
						recordType: request.parameters.custpage_tran_rec_type,
						recordId: request.parameters.custpage_tran_id,
						workflowId: wfID,
						stateId: wfState,
						actionId: wfAction
					});
					log.audit(title, 'workflowInstanceId: ' + workflowInstanceId)
					
					/*if (workflowInstanceId) {
						//Update Finance Approved
						var approvalId = _libops.searchApprovalFlow(tranInternalId, lvl);
						_libops.updateApprovalFlow(approvalId, "Rejected", runtime.getCurrentUser().id, rejectionReason);
					}*/
					
					//close the popup and reload the transaction form to view update data
					var form = ui.createForm({
						title: ' '
					});
					var popUpFld = form.addField({
						id: 'custpage_close_pop_up',
						type: ui.FieldType.INLINEHTML,
						label: 'Pop up field close'
					});
					popUpFld.defaultValue = '<html><body><script>parent.location.reload();window.closePopup();</script></body></html>';

					context.response.writePage(form);
				}catch(error){
					log.audit(title, 'error: ' + JSON.stringify(error));
				}
                
            }
        }
        return {
            onRequest: onRequest
        };
    });