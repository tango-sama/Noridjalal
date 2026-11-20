# صفحة تسجيل المواطنين (`/citizens/`)

صفحة ثابتة (RTL) يملؤها عون الإدارة لتسجيل مواطن في Google Sheet، مع مؤشر أهمية بأربع درجات.
الصفوف في الورقة تُلوَّن وتُرتَّب تلقائيًا: الأهم أولًا، ثم الأقدم تسجيلًا ضمن الدرجة نفسها.

## الإعداد (داخل نفس مشروع Apps Script الخاص بالصفحة الرئيسية)
1. افتح مشروع Apps Script المرتبط بملف الـ Sheet (الإضافات → Apps Script).
2. أضف ملفًا جديدًا (+ ← Script) باسم `Citizens` والصق فيه محتوى `apps-script/Citizens.gs`.
3. في `Code.gs` داخل `doPost`، مباشرة بعد سطر `const data = JSON.parse(...)`، أضف السطر:
   `if (data.accessCode !== undefined) return handleCitizen_(data);`
4. من Project Settings → Script properties أضف `ACCESS_CODE` = رمز سري لأعوان الإدارة.
5. Deploy → Manage deployments → ✏️ → Version: **New version** → Deploy (يبقى الرابط نفسه).
6. ضع رابط `/exec` نفسه في `config.js`.

## ملاحظات
- يُنشأ تبويب «المواطنون» تلقائيًا عند أول تسجيل.
- رمز الدخول يُتحقَّق منه في Apps Script وليس في المتصفح. أبقِ الملف خاصًا.
- بيانات المواطنين شخصية: لا تشارك الملف إلا مع المخوّلين.
