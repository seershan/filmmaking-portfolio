document.addEventListener("DOMContentLoaded", () => {
  PortfolioSite.setupNav("../");
  PortfolioSite.validateAndAnimateForm(document.getElementById("contact-form"));
});