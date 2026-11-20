/**
 * تسجيل المواطنين — Google Apps Script
 * يضيف مواطنًا إلى الورقة، ثم يرتّب كل الصفوف (الأهم أولًا، ثم الأقدم تسجيلًا)
 * ويلوّنها بحسب درجة الأهمية.
 *
 * الإعداد: Project Settings → Script properties
 *   SHEET_ID     معرّف ملف Google Sheet
 *   ACCESS_CODE  رمز سري يعرفه أعوان الإدارة فقط
 */
var SHEET_NAME = 'المواطنون';
var HEADERS = ['رقم التسجيل', 'تاريخ التسجيل', 'الاسم واللقب', 'العمر', 'رقم الهاتف',
  'الحي / القرية', 'العنوان', 'الطلب / الانشغال', 'درجة الأهمية', 'الدرجة (1-4)', 'عون الإدارة'];
var COL_ID = 1, COL_LEVEL_NUM = 10;
var LEVELS = {
  4: { label: 'مهم جدًا',   color: '#f4b6b0' },
  3: { label: 'مهم',        color: '#fbd9a5' },
  2: { label: 'أقل أهمية',  color: '#fff3b0' },
  1: { label: 'غير مهم',    color: '#d6ead3' }
};

function doGet() { return json_({ status: 'ok', message: 'service running' }); }

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var props = PropertiesService.getScriptProperties();
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (!props.getProperty('ACCESS_CODE') || String(d.accessCode || '') !== props.getProperty('ACCESS_CODE')) {
      return json_({ status: 'error', message: 'رمز الدخول غير صحيح.' });
    }
    var name = clean_(d.fullName, 150), phone = clean_(d.phone, 20), level = Number(d.level);
    var age = Number(d.age);
    if (!name || !/^(05|06|07)[0-9]{8}$/.test(phone) || !(age >= 1 && age <= 120) || !LEVELS[level]) {
      return json_({ status: 'error', message: 'بيانات غير صحيحة، راجع الحقول.' });
    }

    var sheet = getSheet_(props.getProperty('SHEET_ID'));
    var last = sheet.getLastRow();
    var nextId = last > 1 ? Math.max.apply(null, sheet.getRange(2, COL_ID, last - 1, 1).getValues().map(function (r) { return Number(r[0]) || 0; })) + 1 : 1;

    sheet.appendRow([nextId, new Date(), name, age, "'" + phone, clean_(d.area, 100), clean_(d.address, 250),
      clean_(d.request, 1000), LEVELS[level].label, level, clean_(d.agent, 100)]);
    sortAndColor_(sheet);
    return json_({ status: 'success', message: 'تم تسجيل المواطن بنجاح (رقم ' + nextId + ').' });
  } catch (err) {
    return json_({ status: 'error', message: 'حدث خطأ، حاول مجددًا.' });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function getSheet_(id) {
  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.setRightToLeft(true);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold')
      .setBackground('#0c5147').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.getRange(2, 5, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
  }
  return sheet;
}

function sortAndColor_(sheet) {
  var rows = sheet.getLastRow() - 1;
  if (rows < 1) return;
  var range = sheet.getRange(2, 1, rows, HEADERS.length);
  range.sort([{ column: COL_LEVEL_NUM, ascending: false }, { column: COL_ID, ascending: true }]);
  var levels = sheet.getRange(2, COL_LEVEL_NUM, rows, 1).getValues();
  var colors = levels.map(function (r) {
    var c = (LEVELS[r[0]] || {}).color || '#ffffff';
    return HEADERS.map(function () { return c; });
  });
  range.setBackgrounds(colors);
}

function clean_(v, max) {
  var s = String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s; // منع حقن الصيغ
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
