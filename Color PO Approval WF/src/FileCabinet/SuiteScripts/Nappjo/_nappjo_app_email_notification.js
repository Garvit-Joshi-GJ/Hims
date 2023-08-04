/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * @NAmdConfig  ./PATHS_approvals.json
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/file', 'N/record', 'N/url', 'N/runtime', 'N/render', 'lib_operations'], function (email, file, record, url, runtime, render, _lib_approvals) {
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
            var record = scriptContext.newRecord;
            log.debug('record obj', record);
            log.debug('SEND_EMAIL_FUNC', JSON.stringify(record));
            var scriptObj = runtime.getCurrentScript();
            var senderId = scriptObj.getParameter({
                name: 'custscript_app_email_author'
            }); //get it from script parameter
            var replytoEmailCapture = scriptObj.getParameter({
                name: 'custscript_app_email_capture'
            }); //get it from script parameter
            var emailTemplate = scriptObj.getParameter({
                name: 'custscript_app_email_template'
            }); //get it from script parameter
            var tranId = record.getValue('tranid');
            var total = record.getValue('total');
            total = parseFloat(total).toFixed(2);
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });
            var relativePath = url.resolveRecord({
                recordType: record.type,
                recordId: record.id,
                isEditMode: false
            });
            var recUrl = "" + scheme + host + relativePath;
            var nextapprover = record.getText('custbody_nappjo_next_approver'),//nextapprover
                total = record.getValue('total'),
                id = record.id,
                employee = record.getText('employee');
            //var emailBody = "Please find details of a PO from " + employee + "<br>You can take action by following ways:<BR><br>1. Follow link in the email and approve/reject in NetSuite.<br>2. Approve or Reject bill by replying to email with Approve or Reject as text.If rejecting, add 'Rejection Comments:' text and then your comments. At the end of the comments please add '#endrejectioncomment' this text.<br><br>Next Approver: " + nextapprover + "<br>PurchaseOrder Total Amount: " + total + "<br>PurchaseOrder InternalId: " + id + " #endid<br><br>Thanks!"
            //emailBody += '<br><br><a href="' + recUrl + '">View Record</a><br><br><br>';
            //var emailSubject = "PO# " + record.getValue('tranid') + " is pending for your approval"
            var recipientId = [];

            var currentApprovalStatus = record.getValue('approvalstatus');
            log.debug(title, 'currentApprovalStatus:' + currentApprovalStatus);
            if (currentApprovalStatus == 2 || currentApprovalStatus == 3) {
                recipientId.push(record.getValue('employee'));
                var buyerEmailAddress = record.getValue('custbodymam_po_buyer_email');
                log.debug(title, 'buyerEmailAddress:' + buyerEmailAddress);
                if (!isEmpty(buyerEmailAddress))
                    recipientId.push(buyerEmailAddress);
            } else {
                recipientId = record.getValue('custbody_nappjo_next_approver');
            }
            var transactionFile = render.transaction({
                entityId: record.id,
                printMode: render.PrintMode.PDF
            });
            var myMergeResult = render.mergeEmail({
                templateId: emailTemplate,
                transactionId: record.id,
            });
            var subjectStr = myMergeResult.subject;
            var emailBodyStr = myMergeResult.body;

            //Get approval trial history
            var approverHistoryTable = "";
            var approvalTrialResult = _lib_approvals._getTransactionApprovalTrial(id);
            log.debug('approvalTrialResult', JSON.stringify(approvalTrialResult));
            if (JSON.stringify(approvalTrialResult) !== '{}') {
                approverHistoryTable = _lib_approvals._generateApprovalTable(approvalTrialResult);
            }

            emailBodyStr = emailBodyStr.replace('~APPROVAL_TRIAL~', approverHistoryTable)
            emailBodyStr = emailBodyStr.replace('~VIEW_RECORD~', '<a href="' + recUrl + '">View Record</a>')

            var emailOptions = {
                emailSent: false,
                recipients: recipientId,
                subject: subjectStr, //emailSubject,
                body: emailBodyStr, //emailBody,
                attachments: [transactionFile],
                replyTo: replytoEmailCapture,
                relatedRecords: {
                    entityId: senderId,
                    transactionId: record.id
                }
            };
            emailOptions.author = senderId;
            log.debug('SEND_EMAIL_FUNC', JSON.stringify(emailOptions));
            email.send(emailOptions);
            var currentDate = new Date();
            log.debug('current date', currentDate);
            record.setValue('custbody_last_email_sent_date', currentDate);
            return;
        } catch (error) {
            log.audit(title, 'error: ' + JSON.stringify(error));
        }
    }
    function isEmpty(str) {
        if (str == '' || str == null || str == undefined || str == 'undefined') return true;
        return false;
    }

    function isArrayEmpty(array) {
        return !Array.isArray(array) || !array.length
    }
    return {
        onAction: onAction
    };
});