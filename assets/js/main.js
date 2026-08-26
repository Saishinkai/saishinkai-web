(() => {
  "use strict";
  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".global-nav");
  if (menuButton && nav) {
    const close = () => { menuButton.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); };
    menuButton.addEventListener("click", () => { const open = menuButton.getAttribute("aria-expanded") !== "true"; menuButton.setAttribute("aria-expanded", String(open)); nav.classList.toggle("is-open", open); });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") { close(); menuButton.focus(); } });
  }
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const startedAt = form.querySelector("#startedAt");
  const status = form.querySelector("#form-status");
  const submitButton = form.querySelector("button[type=submit]");
  const message = form.querySelector("#message");
  const counter = form.querySelector("#message-count");
  let sending = false;
  const resetStart = () => { startedAt.value = String(Date.now()); };
  resetStart();
  message.addEventListener("input", () => { counter.textContent = `${message.value.length} / 2000`; });
  const messages = { name: "お名前を入力してください。", email: "有効なメールアドレスを入力してください。", inquiryType: "お問い合わせの種類を選択してください。", message: "お問い合わせ内容を10文字以上で入力してください。", privacyConsent: "個人情報の取扱いへの同意が必要です。" };
  const showError = (field, text) => { const output = document.getElementById(`${field.name}-error`) || document.getElementById(`${field.id.replace("privacy-consent", "privacyConsent")}-error`); if (output) output.textContent = text; field.setAttribute("aria-invalid", "true"); if (output) field.setAttribute("aria-describedby", output.id); };
  const clearErrors = () => { form.querySelectorAll(".error").forEach((el) => el.textContent = ""); form.querySelectorAll("[aria-invalid]").forEach((el) => { el.removeAttribute("aria-invalid"); el.removeAttribute("aria-describedby"); }); };
  const validate = () => {
    clearErrors(); let first = null;
    ["name", "email", "inquiryType", "message", "privacyConsent"].forEach((name) => { const field = form.elements[name]; let invalid = !field.value.trim(); if (name === "email" && field.value) invalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value); if (name === "message" && field.value.trim().length < 10) invalid = true; if (name === "privacyConsent") invalid = !field.checked; if (invalid) { showError(field, messages[name]); first ||= field; } });
    if (first) first.focus(); return !first;
  };
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); if (sending || !validate()) { if (!sending) { status.textContent = "入力内容をご確認ください。"; status.className = "form-status error-status"; } return; }
    const endpoint = window.SAISHINKAI_FORM_CONFIG?.endpoint?.trim();
    if (!endpoint || !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(endpoint)) { status.textContent = "現在、送信先の設定が完了していません。恐れ入りますが、しばらくしてからお試しください。"; status.className = "form-status error-status"; return; }
    sending = true; submitButton.disabled = true; submitButton.textContent = "送信中…"; status.textContent = "送信しています。画面を閉じずにお待ちください。"; status.className = "form-status sending";
    try {
      const response = await fetch(endpoint, { method: "POST", body: new URLSearchParams(new FormData(form)), redirect: "follow" });
      const result = await response.json(); if (!result.ok) throw new Error("Request rejected");
      form.reset(); counter.textContent = "0 / 2000"; resetStart(); status.textContent = "送信が完了しました。お問い合わせありがとうございます。"; status.className = "form-status success";
    } catch (_) { status.textContent = "送信できませんでした。通信環境をご確認のうえ、時間をおいて再度お試しください。"; status.className = "form-status error-status"; }
    finally { sending = false; submitButton.disabled = false; submitButton.textContent = "送信する"; }
  });
})();
