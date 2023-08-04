/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 * @NAmdConfig  ./PATHS_approvals.json
 *@NModuleScope Public
 */
 define(['N/record','lib_operations','N/ui/message'],
 function(record,_lib_approvals,message) {
     var DEPT = null;
     /*
      * Validate email address fields
      */
     function postSourcing(context) {
         var objRecord 	= context.currentRecord;
         
         var stFldId 	= context.fieldId;
         console.log(stFldId)
         if (stFldId == 'employee'){	
             objRecord.setValue({fieldId: 'department',value: DEPT});
         }
     }	
     
     /*
      * Set Default Subtabs to Build on create
      * Version added: 1.1.0
      */
     function fieldChanged(context) {
        // if (context.mode !== 'edit')
          //   return;
         
         var stFldId 	= context.fieldId;
         console.log(stFldId)
         if (stFldId == 'employee'){
             var currentRecord = context.currentRecord;
             DEPT = currentRecord.getValue({fieldId: 'department'});
         }			
     }
     
     /*
      * On save validations
      * Version added: 1.1.0
      */
     function saveRecord(context) {
         //Script to stop PO creation if there is no approval hierarchy available for approval
         var currentRecord = context.currentRecord;
         var recordObj = new Object();
         recordObj.department = currentRecord.getValue('department');
         var hasHierarchy = _lib_approvals._hasHierarchy(recordObj);
           console.log('has PO Approval Hierarchy? '+ hasHierarchy)
         if(_lib_approvals._isEmpty(hasHierarchy)){
             var noApprovalHierarchyErrorMsg = message.create({
                 title: 'Selected department does not exist in the PO Approval matrix',
                 message: "<b>ERROR: You have selected a department that does not exist in the PO approval matrix. Please update and try saving again.",
                 type: message.Type.ERROR,
                   duration: 12000
             });
             noApprovalHierarchyErrorMsg.show();
               window.scrollTo(0,0);
             return;
         }
         return true;
     }
     return {
         postSourcing: postSourcing,
         fieldChanged: fieldChanged,
         saveRecord: saveRecord
     };
 });