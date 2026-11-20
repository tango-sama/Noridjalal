const form = document.querySelector("#citizen-form");
const statusBox = document.querySelector("#status");
const level = document.querySelector("#level");
const meter = document.querySelector("#meter");
const label = document.querySelector("#level-label b");
const button = form.querySelector(".submit");
const LEVELS = {
  1: ["غير مهم", "var(--l1)"], 2: ["أقل أهمية", "var(--l2)"],
  3: ["مهم", "var(--l3)"], 4: ["مهم جدًا", "var(--l4)"]
};

function syncLevel() {
  const [text, color] = LEVELS[level.value];
  label.textContent = text;
  meter.style.setProperty("--c", color);
}
level.addEventListener("input", syncLevel);
syncLevel();

function show(type, text) { statusBox.className = "status " + type; statusBox.textContent = text; }

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  show("", "");
  if (!form.reportValidity()) return;
  const url = (window.APP_CONFIG || {}).APPS_SCRIPT_URL || "";
  if (!/^https:\/\/script\.google\.com\//.test(url)) return show("err", "لم يُضبط رابط الخدمة في config.js بعد.");

  const data = Object.fromEntries(new FormData(form).entries());
  data.level = Number(level.value);
  button.disabled = true; button.textContent = "جارٍ التسجيل…";
  try {
    // text/plain لتفادي طلب preflight مع Apps Script
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) });
    const result = await res.json();
    if (result.status !== "success") throw new Error(result.message || "تعذر التسجيل.");
    show("ok", result.message);
    const keep = { accessCode: data.accessCode, agent: data.agent };
    form.reset();
    form.accessCode.value = keep.accessCode; form.agent.value = keep.agent; // يبقى عون الإدارة جاهزًا للمواطن التالي
    syncLevel();
  } catch (err) {
    show("err", err.message || "تعذر التسجيل، حاول لاحقًا.");
  } finally {
    button.disabled = false; button.textContent = "تسجيل";
  }
});
