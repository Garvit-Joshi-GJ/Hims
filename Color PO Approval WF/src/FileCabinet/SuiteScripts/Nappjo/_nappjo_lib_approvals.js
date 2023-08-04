/** 
 * LIB_curo_admin_integration.js
 * @NApiVersion 2.x
 * @NModuleScope Public 
 */
 define(['N/record', 'N/runtime', 'N/search', 'N/format', 'N/url', 'N/https'], function (record, runtime, search, format, url, https) {
	var defaultValues = {
		"SOAP_ORDER": {
			"SOAP_APPROVER_UNAVAILABLE": "APPROVER_NOT_AVAILABLE_FOR_SOAP_INTEGRATED_PO"
		}
	};
	function nextApprover(filterObj, alreadyApprovedByUsers) {
		var title = "nextApprover";
		log.debug(title, "filterObj:" + JSON.stringify(filterObj));
		var customrecord_nappjo_approval_ruleSearchObj = search.create({
			type: "customrecord_nappjo_approval_rule",
			filters: [
				["custrecord_approval_amt_from", "lessthanorequalto", filterObj.total], "AND",
				["isinactive", "is", 'F'], "AND",
				[
					[
						["custrecord_approval_starts", "onorbefore", filterObj.date], "OR", ["custrecord_approval_starts", "isempty", ""]
					], "AND", [
						["custrecord_approval_ends", "onorafter", filterObj.date], "OR", ["custrecord_approval_ends", "isempty", ""]
					]
				]
			],
			columns: [
				search.createColumn({
					name: "custrecord_approval_lvl",
					sort: search.Sort.ASC,
					label: "Level"
				}),
				search.createColumn({
					name: "custrecord_approval_approver_list",
					label: "Approvers"
				}),
				search.createColumn({
					name: "custrecord_approval_amt_from",
					label: "Amount From"
				}),
				search.createColumn({
					name: "custrecord_approval_amt_to",
					label: "Amount To"
				}),
				search.createColumn({
					name: "custrecord_approval_starts",
					label: "Start Date"
				}),
				search.createColumn({
					name: "custrecord_approval_ends",
					label: "Expiry Date"
				})
			]
		});
		//,"AND",[["custrecord_approval_amt_to","greaterthanorequalto",filterObj.total],"OR",["custrecord_approval_amt_to","isempty",""]]
		log.debug(title, "filter Expression: " + JSON.stringify(customrecord_nappjo_approval_ruleSearchObj.filterExpression));
		var filtersExp = customrecord_nappjo_approval_ruleSearchObj.filterExpression;
		if (!isEmpty(filterObj.department)) {
			filtersExp.push("AND");
			filtersExp.push(["custrecord_approval_dept", "anyof", filterObj.department]);
		} else {
			filtersExp.push("AND");
			filtersExp.push(["custrecord_approval_dept", "anyof", "@NONE@"]);
		}
		if (!isEmpty(filterObj.lvl)) {
			var valueFilter = "{custrecord_approval_lvl.id} >" + filterObj.lvl;
			var formulaValue = ["formulanumeric: Case when " + valueFilter.toString() + " then 1 else 0 end", "equalto", "1"] //"Case when " + valueFilter.toString() + " then 1 else 0 end"
			filtersExp.push("AND");
			filtersExp.push(formulaValue);
		}
		customrecord_nappjo_approval_ruleSearchObj.filterExpression = filtersExp;
		var approverObj = new Object();
		approverObj.next_approver = null;
		approverObj.next_lvl = null;
		approverObj.is_approver_available = false;
		approverObj.autoApprover = null;
		approverObj.autoApproveLvls = [];

		var tempApproval = {
			approver: null,
			lvl: null
		},
			autoApprovalLvl = [], autoApprover = false;
		var searchResultCount = customrecord_nappjo_approval_ruleSearchObj.runPaged().count;
		log.debug(title, "Total Approval Levels: " + searchResultCount);
		customrecord_nappjo_approval_ruleSearchObj.run().each(function (result) {
			approverObj.next_approver = result.getValue('custrecord_approval_approver_list').toString().split(",");
			approverObj.next_lvl = result.getValue('custrecord_approval_lvl');
			approverObj.next_lvl_txt = result.getText('custrecord_approval_lvl');

			//approverObj.is_approver_available = true;
			log.debug(title, "Approver: " + approverObj.next_approver);
			log.debug(title, "Lvl: " + approverObj.next_lvl);

			if (isEmpty(approverObj.next_approver)) {
				return true;
			} 
			
			/*else {
				if (alreadyApprovedByUsers.indexOf(approverObj.next_approver) > -1) {
					approverObj.autoApprover = approverObj.next_approver;
					autoApprovalLvl.push(approverObj.next_lvl_txt);
					autoApprover = true;
					return true;

				} else {
					autoApprover = false;
				}
			}*/


		});

		if (autoApprover) {
			approverObj.next_approver = "";
			approverObj.next_lvl = "";
			//approverObj.autoApprover = approverObj.next_approver;
			//autoApprovalLvl.push(approverObj.next_lvl_txt);
		}

		approverObj.autoApproveLvls = autoApprovalLvl;

		if (!isEmpty(approverObj.next_approver))
			approverObj.is_approver_available = true;

		return approverObj;
	}

	function hasAutoApproval(filterObj) {
		var title = "nextApprover";
		log.debug(title, "filterObj:" + JSON.stringify(filterObj));
		var customrecord_nappjo_approval_ruleSearchObj = search.create({
			type: "customrecord_nappjo_approval_rule",
			filters: [
				["custrecord_approval_amt_from", "lessthanorequalto", filterObj.total], "AND",
				["isinactive", "is", 'F'], "AND",
				[
					[
						["custrecord_approval_starts", "onorbefore", filterObj.date], "OR", ["custrecord_approval_starts", "isempty", ""]
					], "AND", [
						["custrecord_approval_ends", "onorafter", filterObj.date], "OR", ["custrecord_approval_ends", "isempty", ""]
					]
				]
			],
			columns: [
				search.createColumn({
					name: "custrecord_approval_lvl",
					sort: search.Sort.ASC,
					label: "Level"
				}),
				search.createColumn({
					name: "custrecord_approval_approver_list",
					label: "Approvers"
				}),
				search.createColumn({
					name: "custrecord_approval_amt_from",
					label: "Amount From"
				}),
				search.createColumn({
					name: "custrecord_approval_amt_to",
					label: "Amount To"
				}),
				search.createColumn({
					name: "custrecord_approval_starts",
					label: "Start Date"
				}),
				search.createColumn({
					name: "custrecord_approval_ends",
					label: "Expiry Date"
				})
			]
		});
		//,"AND",[["custrecord_approval_amt_to","greaterthanorequalto",filterObj.total],"OR",["custrecord_approval_amt_to","isempty",""]]
		log.debug(title, "filter Expression: " + JSON.stringify(customrecord_nappjo_approval_ruleSearchObj.filterExpression));
		var filtersExp = customrecord_nappjo_approval_ruleSearchObj.filterExpression;
		if (!isEmpty(filterObj.department)) {
			filtersExp.push("AND");
			filtersExp.push(["custrecord_approval_dept", "anyof", filterObj.department]);
		} else {
			filtersExp.push("AND");
			filtersExp.push(["custrecord_approval_dept", "anyof", "@NONE@"]);
		}
		if (!isEmpty(filterObj.lvl)) {
			var valueFilter = "{custrecord_approval_lvl.id} >" + filterObj.lvl;
			var formulaValue = ["formulanumeric: Case when " + valueFilter.toString() + " then 1 else 0 end", "equalto", "1"] //"Case when " + valueFilter.toString() + " then 1 else 0 end"
			filtersExp.push("AND");
			filtersExp.push(formulaValue);
		}
		customrecord_nappjo_approval_ruleSearchObj.filterExpression = filtersExp;
		var approverObj = new Object();
		approverObj.next_approver = null;
		approverObj.auto_approved = 'F';

		var searchResultCount = customrecord_nappjo_approval_ruleSearchObj.runPaged().count;
		log.debug(title, "Total Approval Levels: " + searchResultCount);

		if (searchResultCount == 0) {
			approverObj.auto_approved = 'F';
		} else {
			customrecord_nappjo_approval_ruleSearchObj.run().each(function (result) {
				approverObj.next_approver = result.getValue('custrecord_approval_approver_list');
				log.debug(title, "Approver: " + approverObj.next_approver);

				if (isEmpty(approverObj.next_approver)) {
					return true;
				}
			});
			if (isEmpty(approverObj.next_approver))
				approverObj.auto_approved = 'T';
		}
		return approverObj.auto_approved;
	}

	function hasHierarchy(filterObj) {
		var hierarchy = false;
		var customrecord_nappjo_approval_ruleSearchObj = search.create({
			type: "customrecord_nappjo_approval_rule",
			filters: [
				["isinactive", "is", 'F']
			],
			columns: [
				search.createColumn({
					name: "custrecord_approval_lvl",
					sort: search.Sort.ASC,
					label: "Level"
				})
			]
		});
		var filtersExp = customrecord_nappjo_approval_ruleSearchObj.filterExpression;
		if (!isEmpty(filterObj.department)) {
			filtersExp.push("AND");
			filtersExp.push(["custrecord_approval_dept", "anyof", filterObj.department]);
		} else {
			filtersExp.push("AND");
			filtersExp.push(["custrecord_approval_dept", "anyof", "@NONE@"]);
		}

		customrecord_nappjo_approval_ruleSearchObj.filterExpression = filtersExp;
		if (customrecord_nappjo_approval_ruleSearchObj.runPaged().count > 0) {
			hierarchy = true;
		}
		return hierarchy;
	}

	function createApprovalTrial(dataObj) {
		var title = "createApprovalTrial";
		log.error(title, 'dataObj: ' + JSON.stringify(dataObj));
		var approvalTrialRec = "";
		log.error(title, '***New Approval Trial Creation***');
		var approvalTrialRec = record.create({
			type: 'customrecord_approval_trail',
			isDynamic: true
		});
		//Action Context
		if (!isEmpty(dataObj.custrecord_app_trial_action_context)) {
			approvalTrialRec.setValue({
				fieldId: 'custrecord_app_trial_action_context',
				value: dataObj.custrecord_app_trial_action_context
			});
		}
		//Action Date
		/*if (!isEmpty(dataObj.custrecord_app_trial_action_date)) {
			approvalTrialRec.setValue({
				fieldId: 'custrecord_app_trial_action_date',
				value: dataObj.custrecord_app_trial_action_date
			});
		}*/
		//Action Taken
		if (!isEmpty(dataObj.custrecord_app_trial_action_taken)) {
			approvalTrialRec.setValue({
				fieldId: 'custrecord_app_trial_action_taken',
				value: dataObj.custrecord_app_trial_action_taken
			});
		}
		//Approval State
		if (!isEmpty(dataObj.custrecord_app_trial_app_state)) {
			approvalTrialRec.setValue({
				fieldId: 'custrecord_app_trial_app_state',
				value: dataObj.custrecord_app_trial_app_state
			});
		}
		//Approval Status
		if (!isEmpty(dataObj.custrecord_app_trial_app_status)) {
			approvalTrialRec.setValue({
				fieldId: 'custrecord_app_trial_app_status',
				value: dataObj.custrecord_app_trial_app_status
			});
		}
		//Approver
		if (!isEmpty(dataObj.custrecord_app_trial_approver)) {
			approvalTrialRec.setValue({
				fieldId: 'custrecord_app_trial_approver',
				value: dataObj.custrecord_app_trial_approver
			});
		}
		//Original Approver
		/*if (!isEmpty(dataObj.custrecord_app_trial_original_approver)) {
			approvalTrialRec.setValue({
				fieldId: 'custrecord_app_trial_original_approver',
				value: dataObj.custrecord_app_trial_original_approver
			});
		}*/

		//Original Approvers
		if (!isEmpty(dataObj.custrecordapp_trial_original_approvers)) {
			approvalTrialRec.setValue({
				fieldId: 'custrecordapp_trial_original_approvers',
				value: dataObj.custrecordapp_trial_original_approvers
			});
		}

		//Role
		if (!isEmpty(dataObj.custrecord_app_trial_role)) {
			approvalTrialRec.setValue({
				fieldId: 'custrecord_app_trial_role',
				value: dataObj.custrecord_app_trial_role
			});
		}
		//Transaction#
		if (!isEmpty(dataObj.custrecord_app_trial_tran_no)) {
			approvalTrialRec.setValue({
				fieldId: 'custrecord_app_trial_tran_no',
				value: dataObj.custrecord_app_trial_tran_no
			});
		}
		//Comments
		if (!isEmpty(dataObj.custrecord_app_trial_comments)) {
			approvalTrialRec.setValue({
				fieldId: 'custrecord_app_trial_comments',
				value: dataObj.custrecord_app_trial_comments
			});
		}
		var approvalTrialId = approvalTrialRec.save({
			enableSourcing: true
		});
		return approvalTrialId;
	}

	function inactivateApprovalTrials(tranID) {
		var customrecord_approval_trailSearchObj = search.create({
			type: "customrecord_approval_trail",
			filters: [
				["custrecord_app_trial_tran_no", "anyof", tranID]
			],
			columns: [
				search.createColumn({
					name: "scriptid",
					sort: search.Sort.ASC,
					label: "Script ID"
				}),
				search.createColumn({
					name: "custrecord_app_trial_app_state",
					label: "APPROVAL STATE"
				}),
				search.createColumn({
					name: "custrecord_app_trial_approver",
					label: "APPROVER"
				}),
				search.createColumn({
					name: "custrecord_app_trial_role",
					label: "APPROVER ROLE"
				}),
				search.createColumn({
					name: "custrecord_app_trial_action_taken",
					label: "ACTION TAKEN"
				}),
				search.createColumn({
					name: "custrecord_app_trial_action_date",
					label: "ACTION DATE"
				}),
				search.createColumn({
					name: "custrecord_app_trial_app_status",
					label: "APPROVAL STATUS"
				}),
				search.createColumn({
					name: "custrecord_app_trial_action_context",
					label: "ACTION CONTEXT"
				}),
				search.createColumn({
					name: "custrecord_app_trial_original_approver",
					label: "ORIGNAL APPROVER"
				})
			]
		});
		customrecord_approval_trailSearchObj.run().each(function (result) {
			var id = record.submitFields({
				type: 'customrecord_approval_trail',
				id: result.id,
				values: {
					isinactive: true
				},
				options: {
					enableSourcing: false,
					ignoreMandatoryFields: true
				}
			});
			// .run().each has a limit of 4,000 results
			return true;
		});
	}

	function getAlreadyApprovedByUsers(tranID) {
		var approvedUserIds = [];
		var customrecord_approval_trailSearchObj = search.create({
			type: "customrecord_approval_trail",
			filters: [
				["custrecord_app_trial_tran_no", "anyof", tranID], "AND",
				["isinactive", "is", 'F']
			],
			columns: [
				search.createColumn({
					name: "custrecord_app_trial_approver",
					label: "APPROVER"
				}),
				search.createColumn({
					name: "custrecord_app_trial_original_approver",
					label: "ORIGNAL APPROVER"
				})
			]
		});
		customrecord_approval_trailSearchObj.run().each(function (result) {
			approvedUserIds.push(result.getValue('custrecord_app_trial_original_approver'));
			return true;
		});
		return approvedUserIds;
	}

	function getTransactionApprovalTrial(tranID) {
		var appTrialResult = {};
		var customrecord_approval_trailSearchObj = search.create({
			type: "customrecord_approval_trail",
			filters: [
				["custrecord_app_trial_tran_no", "anyof", tranID], "AND",
				["isinactive", "is", 'F']
			],
			columns: [
				search.createColumn({
					name: "internalid",
					label: "INTERNALID"
				}),
				search.createColumn({
					name: "custrecord_app_trial_approver",
					label: "APPROVER"
				}),
				/*search.createColumn({
					name: "custrecord_app_trial_original_approver",
					label: "ORIGNAL APPROVER"
				}),*/
				search.createColumn({
					name: "custrecordapp_trial_original_approvers",
					label: "APPROVERS"
				}),
				search.createColumn({
					name: "custrecord_app_trial_action_taken",
					label: "ACTION TAKEN"
				}),
				search.createColumn({
					name: "custrecord_app_trial_action_date",
					label: "DATE"
				})
			]
		});

		customrecord_approval_trailSearchObj.run().each(function (result) {
			var internalID = result.getValue('internalid');
			appTrialResult[internalID] = {};
			appTrialResult[internalID].date = result.getValue('custrecord_app_trial_action_date');
			appTrialResult[internalID].approver = result.getText('custrecord_app_trial_approver');
			appTrialResult[internalID].originalApprover = result.getText('custrecordapp_trial_original_approvers').toString().replace(/,/gi,'<br>');//custrecord_app_trial_original_approver
			appTrialResult[internalID].actionTaken = result.getValue('custrecord_app_trial_action_taken');
			return true;
		});
		return appTrialResult;
	}

	function generateApprovalTable(approvalTrialResult) {
		var approverHistoryTable = "";
		approverHistoryTable += "<br>Approvers: <br>";
		approverHistoryTable += '<table style="border-collapse: collapse;font-family:Arial,Helvetica,sans-serif;font-size:12px;table-layout:auto">';
		approverHistoryTable += '<tr>'
		approverHistoryTable += '<th style="text-align: left;padding: 8px;border: 1px solid #dddddd;">Date</th>'
		approverHistoryTable += '<th style="text-align: left;padding: 8px;border: 1px solid #dddddd;">Approver</th>'
		approverHistoryTable += '<th style="text-align: left;padding: 8px;border: 1px solid #dddddd;">Original Approver</th>'
		approverHistoryTable += '<th style="text-align: left;padding: 8px;border: 1px solid #dddddd;">Action Taken</th>'
		approverHistoryTable += '<th style="text-align: left;padding: 8px;border: 1px solid #dddddd;">Auto Approved</th>';
		approverHistoryTable += '</tr>'
		for (var key in approvalTrialResult) {

			var autoApproved = approvalTrialResult[key]["actionTaken"] === "Auto-approved" ? "Yes" : "No";
			approverHistoryTable += '<tr>';
			approverHistoryTable += '<td style="text-align: left;padding: 8px;border: 1px solid #dddddd;">' + approvalTrialResult[key]["date"] + '</td>';
			approverHistoryTable += '<td style="text-align: left;padding: 8px;border: 1px solid #dddddd;">' + approvalTrialResult[key]["approver"] + '</td>';
			approverHistoryTable += '<td style="text-align: left;padding: 8px;border: 1px solid #dddddd;">' + approvalTrialResult[key]["originalApprover"] + '</td>';
			approverHistoryTable += '<td style="text-align: left;padding: 8px;border: 1px solid #dddddd;">' + approvalTrialResult[key]["actionTaken"] + '</td>';
			approverHistoryTable += '<td style="text-align: left;padding: 8px;border: 1px solid #dddddd;">' + autoApproved + '</td>';
			approverHistoryTable += '</tr>';
		}

		approverHistoryTable += '</table>';

		return approverHistoryTable;
	}

	function isEmpty(att) {
		if (att == '' || att == null || att == undefined) return true;
		return false;
	}
	return {
		_nextApprover: nextApprover,
		_isEmpty: isEmpty,
		_createApprovalTrial: createApprovalTrial,
		_inactivateApprovalTrials: inactivateApprovalTrials,
		_getAlreadyApprovedByUsers: getAlreadyApprovedByUsers,
		_hasHierarchy: hasHierarchy,
		_defaultValues: defaultValues,
		_hasAutoApproval: hasAutoApproval,
		_getTransactionApprovalTrial: getTransactionApprovalTrial,
		_generateApprovalTable: generateApprovalTable
	};
});