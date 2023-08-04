/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect','N/runtime','N/search','N/ui','N/ui/serverWidget'],
/**
 * @param {record} record
 * @param {redirect} redirect
 * @param {serverWidget} serverWidget
 */
function(record, redirect,runtime, search,ui,serverWidget) {
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
     var script=runtime.getCurrentScript();
     log.debug('scriptObj',script);
     var adminRoles=script.getParameter('custscript_admin_role_list');
     var json = '[' + adminRoles + ']';
     var array = JSON.parse(json);
     log.debug('Admin roles',array);
   	 var request = context.request;
   	 log.debug('context.request Obj',request);
     var form = serverWidget.createForm({
     		title: 'Delegation Setup Form'
     });
     if(request.method == 'GET'){
    	var selectedEmp=  request.parameters.delegateFor;
    	log.debug('Selected Employee',selectedEmp);
    	var currUser=runtime.getCurrentUser().id;
    	log.debug('current user',currUser);
    	var currUserRole=runtime.getCurrentUser().role;
    	log.debug('current user role',currUserRole);
     	var delegateFor= form.addField({
     		id: 'custpage_delegation_for',
     		type: serverWidget.FieldType.SELECT,
     		label: 'Delegation For',
     		source:'employee'
     	});
     	if(!isEmpty(selectedEmp)){
     		delegateFor.defaultValue=selectedEmp;
     	}
     	log.debug('role',currUserRole);
     	/*if( (currUserRole!=3) ||!isEmpty(selectedEmp)){
     		var delegate= form.addField({
         		id: 'custpage_delegate',
         		type: serverWidget.FieldType.SELECT,
         		label: 'Delegate',
         	});
     	}else{*/
     	var delegate= form.addField({
     		id: 'custpage_delegate',
     		type: serverWidget.FieldType.SELECT,
     		label: 'Delegate',
     		source:'employee'
     	});
     	//}
    	var delegateFromDate= form.addField({
     		id: 'custpage_delegation_from',
     		type: serverWidget.FieldType.DATE,
     		label: 'Delegation Start Date',
     	});
        var delegateToDate= form.addField({
     		id: 'custpage_delegation_to',
     		type: serverWidget.FieldType.DATE,
     		label: 'Delegation End Date',
     	});
        var counter=0;
        for(i=0;i<array.length;i++){
         log.debug('role id',array[i]);
     	 if (currUserRole==array[i]) {
            counter=counter+1;
            break;
        }
        }
        if(counter==0){
     		delegateFor.updateDisplayType({
         		displayType: serverWidget.FieldDisplayType.DISABLED
         	});
     		delegateFor.defaultValue=currUser;
     	}
     	var button = form.addSubmitButton('Submit');
     	context.response.writePage(form);
     }
      else{
    	 //POST
          var reload=request.parameters.custpage_checkbox;
          log.debug('reload',reload);
    	  if(reload=='T'){
            redirect.toSuitelet({
    		    scriptId: 'customscript_setting_delegate',
    		    deploymentId: 'customdeploy_setting_delegate'
    		});
          }
          else{
          var delegateFor = request.parameters.custpage_delegation_for;
          log.debug('Delegate for',delegateFor);
    	  var delegate = request.parameters.custpage_delegate;
          log.debug('Delegate',delegate);
    	  var delToDt = request.parameters.custpage_delegation_to;
          log.debug('Delegation End Date',delToDt);
    	  var delFromDt = request.parameters.custpage_delegation_from;
          log.debug('Delegation Start Date',delFromDt);
            var updatedRecord= record.submitFields({
        	    type:  record.Type.EMPLOYEE,
        	    id: delegateFor,
        	    values: {
        	    	custentity_delegate_approver:delegate,
        	    	custentity_delegation_from:delFromDt,
        	    	custentity_delegation_to:delToDt
        	    },
        	    options: {
        	        enableSourcing: false,
        	        ignoreMandatoryFields : true,
        	        isDynamic: true
        	    }
        	});
            var msg = form.addField({id:'custpage_msg',type:serverWidget.FieldType.INLINEHTML,label:'message'});
            msg.defaultValue="<p style='font-size:20px'>Employee record has been updated successfully.</p><br><br>"
            var reloadSuitelet = form.addField({
                    id: 'custpage_checkbox',
                    label: 'Go back to suitelet',
                    type: serverWidget.FieldType.CHECKBOX
            });
            reloadSuitelet.defaultValue='T';
            reloadSuitelet.updateDisplayType({
         		displayType: serverWidget.FieldDisplayType.HIDDEN
         	});
           form.addSubmitButton('Back');
           context.response.writePage(form);
     }
    }
   }
    function isEmpty(stValue)
    {
    	if ((stValue == '') || (stValue == null) ||(stValue == undefined) || (stValue == 'null'))
        {
            return true;
        }
        return false;
    }

    return {
        onRequest: onRequest
    };
});