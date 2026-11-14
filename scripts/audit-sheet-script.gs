/**
 * The Nervous System Audit: results log
 * Paste this into Extensions > Apps Script in your private Google Sheet,
 * set TOKEN below to the same secret word you put in Cloudflare as SHEET_TOKEN,
 * then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 */
var TOKEN = 'CHANGE-ME-TO-A-SECRET-WORD';
var QUESTIONS = [
  'Wake up tired', 'Rest does not refill', 'Small tasks take everything',
  'Body tight or braced', 'Cannot switch off', 'Phone, snacks, zoning out',
  'Check out from people', 'Flat or numb', 'Snap then feel awful', 'One thing from losing it'
];

function doPost(e) {
  var d = JSON.parse(e.postData.contents || '{}');
  if (d.token !== TOKEN) return out({ ok: false });
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Results') ||
              SpreadsheetApp.getActiveSpreadsheet().insertSheet('Results');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date', 'Name', 'Email', 'Type', 'Second type', 'Score (0 to 40)', 'Tank', 'ADHD',
      'What feels heaviest', 'Check on them', 'Gender', 'Age', 'Perimenopause', 'Already tried', 'What gets in the way', 'Support they want',
      'Found me on', 'What would be different'].concat(QUESTIONS));
    sheet.setFrozenRows(1);
  }
  var answers = (d.answers || []).slice(0, 10);
  sheet.appendRow([new Date(d.date || Date.now()), d.name, d.email, d.type, d.second, d.score, d.level, d.adhd,
    d.heaviest, d.care ? 'YES' : '', d.gender, d.age, d.peri, d.tried, d.stopped, d.support, d.found, d.different].concat(answers));
  if (d.care) sheet.getRange(sheet.getLastRow(), 1, 1, 10).setBackground('#FBE3D3');
  return out({ ok: true });
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
