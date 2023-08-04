/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/runtime'],

	function (record,runtime) {

		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {string} scriptContext.type - Trigger type
		 * @param {Form} scriptContext.form - Current form
		 * @Since 2015.2
		 */
		function beforeLoad(scriptContext) {

		}

		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		function beforeSubmit(scriptContext) {
			var title = "onAction wa_check_change";
			var scriptObj = runtime.getCurrentScript();
			var supEmail = scriptObj.getParameter({
				name: 'custscript_suprvsr_email'
			});
			try {
				var recUpdated = false
				var poNewRecord = scriptContext.newRecord;
				var poOldRecord = scriptContext.oldRecord;
				var status= poNewRecord.getValue('approvalstatus')
				if(status!=2){
					return true
				}
				
				var headerFlds = scriptObj.getParameter({
					name: 'custscript_header_flds'
				});
				if (!isEmpty(headerFlds)) {
					headerFlds = headerFlds.split(',')
				}
				var lineFlds = scriptObj.getParameter({
					name: 'custscript_line_flds'
				});
				if (!isEmpty(lineFlds)) {
					lineFlds = lineFlds.split(',')
				}
				
				// for header flds
				for(var i=0;i<headerFlds.length && recUpdated==false;i++){
					log.debug(title, headerFlds[i]);
					var oldVal = poOldRecord.getValue(headerFlds[i])+''
					var newVal = poNewRecord.getValue(headerFlds[i])+''
					if(oldVal!=newVal){
						recUpdated=true
						break;
					}
				}

				// for Line level Fields
				var lineNumOld = poOldRecord.getLineCount({
					sublistId: 'item'
				}); 
				var lineNumNew = poNewRecord.getLineCount({
					sublistId: 'item'
				}); 
				if(lineNumOld!=lineNumNew){
					recUpdated=true
				}
				for(j=0;j<lineNumNew;j++){
					for(var i=0;i<lineFlds.length && recUpdated==false;i++){
						log.debug(title, lineFlds[i]);
						var oldLineVal=poOldRecord.getSublistValue({
							sublistId: 'item',
							fieldId: lineFlds[i],
							line:j
					 	});
						 oldLineVal=oldLineVal+''
						var newLineVal=poNewRecord.getSublistValue({
							sublistId: 'item',
							fieldId: lineFlds[i],
							line:j
					 	});
						 newLineVal=newLineVal+''
						if(oldLineVal!=newLineVal){
							recUpdated=true
							break;
						}
					}
				}

				if(recUpdated==true){
					poNewRecord.setValue('custbody_po_updted',true)
				}

			} catch (error) {
				log.error(title, 'error: ' + JSON.stringify(error));
				throw "Unable to update Purchase Order. Please Contact Administrator("+supEmail+")"
			}







		}

		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		function afterSubmit(scriptContext) {

		}
		function isEmpty(stValue) {
			if ((stValue == '') || (stValue == null) || (stValue == undefined) || (stValue == 'null')) {
				return true;
			}
			return false;

		}

		return {

			beforeSubmit: beforeSubmit,

		};

	});
