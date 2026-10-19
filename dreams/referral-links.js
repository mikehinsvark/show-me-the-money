(() => {
  "use strict";

  const DEFAULT_REFERRAL_ID = "AA0233";
  const referralValue = new URLSearchParams(window.location.search).get("refid");
  const match = /^(?:AA)?(\d{4})$/i.exec(referralValue || "");
  const effectiveReferralId = match ? `AA${match[1]}` : DEFAULT_REFERRAL_ID;

  document.querySelectorAll("a[href]").forEach((anchor) => {
    const rawHref = anchor.getAttribute("href");
    if (!rawHref) return;

    let destination;
    try {
      destination = new URL(rawHref, window.location.href);
    } catch {
      return;
    }

    if (destination.searchParams.get("refid") !== DEFAULT_REFERRAL_ID) return;

    destination.searchParams.set("refid", effectiveReferralId);
    anchor.setAttribute("href", destination.href);
  });
})();
