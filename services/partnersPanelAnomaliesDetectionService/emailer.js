const constants = require('../../configs/commonConsts');

const anomaliesMailService = function(dataToSend) {
    const {
        PARTNERS_PANEL_INTEGRATION: {
            MAIL: { HEADER_ITEMS }
        }
    } = constants;
    
    const HEADER = HEADER_ITEMS.reduce(
        (acc, item) => {
            acc += `<th scope="col" style="padding:5px; font-family: Arial,sans-serif; font-size: 16px; line-height:20px;line-height:30px">${item}</th>`
            return acc;
        }
    );
    
    const tableRowsString = dataToSend.reduce((acc, item) => {
        acc += `
            <tr>
                <td valign="top" style="padding:5px; font-family: Arial,sans-serif; font-size: 16px; line-height:20px;">
                    Criteo
                </td>
                <td valign="top" style="padding:5px; font-family: Arial,sans-serif; font-size: 16px; line-height:20px;">
                    ${item.domain || item.site_name}
                </td>
                <td valign="top" style="padding:5px; font-family: Arial,sans-serif; font-size: 16px; line-height:20px;">
                    ${item.diffPer}
                </td>
                <td valign="top" style="padding:5px; font-family: Arial,sans-serif; font-size: 16px; line-height:20px;">
                    ${item.pubRevenue}
                </td>
                <td valign="top" style="padding:5px; font-family: Arial,sans-serif; font-size: 16px; line-height:20px;">
                    ${item.adpRevenue}
                </td>
            </tr>
        `;
        return acc;
    }, '');
    const table = `
        <table width="100%" cellpadding="0" cellspacing="0" style="min-width:100%;">
            <thead>
                <tr>
                    ${HEADER}
                </tr>
            </thead>
            <tbody>
                ${tableRowsString}
            </tbody>
        </table>
    `;
    console.log(table);
}

module.exports = {
    anomaliesMailService
}