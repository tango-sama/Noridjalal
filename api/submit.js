export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const { fullname, area, phone = '', message = '' } = req.body || {};
  const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
  const data = {
    fullname: clean(fullname, 100),
    area: clean(area, 120),
    phone: clean(phone, 40),
    message: clean(message, 1500),
  };

  if (!data.fullname || !data.area) {
    return res.status(400).json({ ok: false, message: 'الاسم والحي مطلوبان.' });
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  const secret = process.env.GOOGLE_SCRIPT_SECRET;
  if (!scriptUrl || !secret) {
    return res.status(503).json({ ok: false, message: 'خدمة استقبال الرسائل غير مكتملة الإعداد.' });
  }

  try {
    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, secret }),
      redirect: 'follow',
    });
    const result = await upstream.json();
    if (!upstream.ok || !result.ok) {
      return res.status(502).json({ ok: false, message: 'تعذر حفظ الرسالة في جدول البيانات.' });
    }
    return res.status(200).json({ ok: true, message: 'تم إرسال اقتراحك وحفظه بنجاح. شكراً لمشاركتك.' });
  } catch (error) {
    console.error('Google Sheets submission failed:', error);
    return res.status(502).json({ ok: false, message: 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.' });
  }
}
