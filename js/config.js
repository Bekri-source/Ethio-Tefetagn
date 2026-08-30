/* ==========================================================================
   Ethio Tefetagn — frontend configuration
   Loaded first on every page. Sets window.ETHIOTEFETAGN_API_BASE so main.js,
   chatbot.js, and library.js all know where the backend lives.

   Locally (localhost/127.0.0.1) it points at the local dev server.
   Everywhere else, edit PRODUCTION_API_BASE below to your deployed
   backend's URL once you've deployed it (see DEPLOYMENT.md).
   ========================================================================== */
(function () {
  const LOCAL_API_BASE = "http://localhost:3000";

  // TODO: replace with your real backend URL after deploying it, e.g.
  // "https://api.ethiotefetagn.com" — see DEPLOYMENT.md.
  const PRODUCTION_API_BASE = "";

  const isLocal = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
  window.ETHIOTEFETAGN_API_BASE = isLocal ? LOCAL_API_BASE : PRODUCTION_API_BASE;
})();
