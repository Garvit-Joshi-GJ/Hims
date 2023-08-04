/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search'],

function(runtime, search, _libops) {
    function onAction(scriptContext) {

        var title = "onAction";
        try {
            var newRecord = scriptContext.newRecord;

            var objForm = scriptContext.form;
            //Reject btn
            objForm.addButton({
                id: 'custpage_so_to_reject',
                label: 'Reject',
                functionName: 'reject_call'
            });
            //Client Script
            objForm.clientScriptModulePath = './_nappjo_cli_po_approvals.js';

        }catch (error) {
			log.audit(title, 'error: ' + JSON.stringify(error));
		}
}


return {
    onAction: onAction
};

});