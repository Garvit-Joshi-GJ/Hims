var PO_WORKFLOWID = 'customworkflow_nappjo_req_approval';
var PO_STATE = "workflowstate_approver"
var PO_APPROVE_BUTTON = 'workflowaction_approve_action';
var PO_REJECT_BUTTON = 'workflowaction_rej_action';
var replyFrom = 1076;
var NOT_ORIGINAL_EMAIL_CHAIN = "Unable to process email approval. Email you are replying to is missing details to process email approval.";
var UNABLE_TO_ID_APPROVER_TYPE = "Unable to determine approval type from the email content";
var NEXT_APPROVER_MISMATCH = "The Email ID of the Next Approver doesn't match with sender's approval/rejection. Please have the next approver of this transaction respond to the approval request. Reach out to Admin with any questions or assistance needed.";
var UNKNOWN_EXCEPTION = "Unable to execute requested action. Script failed with error: ";
var EMAIL_FOOTER = "";
var REJ_SUBJECT = 'Unable to Process Action';

// Email Plugin entry point
function process(email) {
	var title = "Process Email Received";

	var subject = email.getSubject();
	var textbody = email.getTextBody();
	var approver = email.getFrom();
	var records = new Object();
	records['entity'] = replyFrom;
	nlapiLogExecution('DEBUG', 'Email_Capture_Plugin', 'subject: ' + subject +
		', textbody: ' + textbody +
		', approver: ' + approver);

	if (subject.indexOf('PO') != -1 && subject.indexOf('is pending for your approval') != -1) {
		var result = processPoApproval(email);
	} else {
		sendEmail(title, REJ_SUBJECT, NOT_ORIGINAL_EMAIL_CHAIN, EMAIL_FOOTER, replyFrom, approver, records);
		return true;
	}
};

function processPoApproval(email) {

	var title = 'processPOApproval';

	var subject = email.getSubject();
	var textbody = email.getTextBody();
	var approverEmail = email.getFrom();
	var msg = "";
	var records = new Object();
	records['entity'] = replyFrom;
	try {
		nlapiLogExecution('DEBUG', title, 'subject: ' + subject +
			', textbody: ' + textbody +
			', approver: ' + approverEmail);



		// Logic to get Internal ID of PO
		var matchString = 'PurchaseOrder InternalId:';
		var poIndex = textbody.indexOf(matchString);
		if (poIndex) {
			poIndex = parseInt(poIndex) + matchString.length;
		}
		nlapiLogExecution('DEBUG', 'After getting index', poIndex);

		var emailSubStr = textbody.substr(poIndex);
		var internalIdLen = emailSubStr.indexOf("#endid");
		nlapiLogExecution('DEBUG', title, 'emailSubStr: ' + emailSubStr + ', vbIndex: ' + poIndex + ', internalIdLen: ' + internalIdLen);

		var poInternalId = (textbody.substr(poIndex, internalIdLen)).trim();
		nlapiLogExecution('DEBUG', title, 'poInternalId: ' + poInternalId);

		var poRec = nlapiLoadRecord('purchaseorder', poInternalId);
		var poDispId = poRec.getFieldValue('tranid');
		var nextApprover = poRec.getFieldValue('nextapprover');


		// Logic to get WF state
		var wfMatchString = 'WF State: ';
		var wfIndexStart = textbody.indexOf(wfMatchString);
		if (wfIndexStart) {
			wfIndexStart = parseInt(wfIndexStart) + wfMatchString.length;
		}
		wfMatchString = ' #WF'
		var wfIndexEnd = textbody.indexOf(wfMatchString);
		if (wfIndexEnd) {
			wfIndexEnd = parseInt(wfIndexEnd);
		}
		var emailWfSubStr = textbody.substr(wfIndexStart, wfIndexEnd);
		var approvalState = emailWfSubStr.split('#')[0].trim();
		//PO_STATE= approvalStateObj[approvalState];


		nlapiLogExecution('DEBUG', title, 'nextApprover: ' + nextApprover);

		var nextApproverEmail = nlapiLookupField('employee', nextApprover, 'email');
		nlapiLogExecution('DEBUG', title, 'approverEmail..' + approverEmail + 'nextApproverEmail: ' + nextApproverEmail);
		/*if (approverEmail != nextApproverEmail) {
			REJ_SUBJECT = 'ERROR - PurchaseOrder # ' + poDispId;
			sendEmail(title, REJ_SUBJECT, NEXT_APPROVER_MISMATCH, EMAIL_FOOTER, replyFrom, approverEmail, records);
			return true;
		}*/
		var wfAction = '';

		var bodyLines = textbody.split(/\r?\n/);
		nlapiLogExecution('DEBUG', title, 'bodyLines: ' + bodyLines);
		var bodyFirstLine = bodyLines[0].toLowerCase();
		nlapiLogExecution('DEBUG', title, 'bodyFirstLine: ' + bodyFirstLine);
		
      	var updatePoFields = [], updatePOvalues = [];
      	updatePoFields.push('custbody_email_capture_action');
		updatePOvalues.push('T');
		if (bodyFirstLine.indexOf('approve') != -1) {
			wfAction = PO_APPROVE_BUTTON;
		} else if (bodyFirstLine.indexOf('reject') != -1) {
			wfAction = PO_REJECT_BUTTON;
			var rejectRsn = bodyLines[1];
			if (rejectRsn.toLowerCase() == 'thanks') {
				rejectRsn = '';
			}
			nlapiLogExecution('DEBUG', 'submitting fields');
			updatePoFields.push('custbody_nappjo_app_rej_reaon')
			updatePOvalues.push(rejectRsn);
          	//var updatefields = nlapiSubmitField('purchaseorder', poInternalId, ['custbody_nappjo_app_rej_reaon','custbody_email_capture_action'], [rejectRsn,true]);	
		} else {
			REJ_SUBJECT = 'ERROR - PurchaseOrder # ' + poDispId;
			sendEmail(title, REJ_SUBJECT, UNABLE_TO_ID_APPROVER_TYPE, EMAIL_FOOTER, replyFrom, approverEmail, records);
			return true;
		}
	    nlapiLogExecution('DEBUG', 'submitting fields', updatePoFields, updatePoFields);
		var updatefields = nlapiSubmitField('purchaseorder', poInternalId, updatePOvalues);	
		
		nlapiLogExecution('DEBUG', title, 'poInternalId: ' + poInternalId +
			', WORKFLOWID: ' + PO_WORKFLOWID +
			', wfAction: ' + wfAction +
			', wfState: ' + PO_STATE);

		var wfInstanceId = nlapiTriggerWorkflow('purchaseorder', poInternalId, PO_WORKFLOWID, wfAction, PO_STATE);
		nlapiLogExecution('DEBUG', title, 'wfInstanceId: ' + wfInstanceId);
		return true;
	} catch (e) {
		UNKNOWN_EXCEPTION = UNKNOWN_EXCEPTION + e.details;
		nlapiLogExecution('DEBUG', 'EXCEPTION', e);
		sendEmail(title, REJ_SUBJECT, UNKNOWN_EXCEPTION, EMAIL_FOOTER, replyFrom, approverEmail, records);
		return true;
	}
}

function sendEmail(title, subject, msg, footer, replyFrom, approverEmail, records) {

	msg = msg + ' ' + footer;

	nlapiLogExecution('ERROR', title, msg);

	nlapiSendEmail(replyFrom, approverEmail, subject, msg, null, null, records);




}

function isEmpty(stValue) {
	if ((stValue == '') || (stValue == null) || (stValue == undefined) || (stValue == 'null')) {
		return true;
	}
	return false;
}