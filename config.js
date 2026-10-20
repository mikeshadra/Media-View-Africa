/*
 * Site configuration.
 * apiBase:         URL of the newsroom API. "/api" uses the bundled server (npm start).
 *                  Set to "" to keep stories in the visitor's browser (demo mode).
 * apiHeaders:      extra headers sent with newsroom writes, e.g. {"x-newsroom-key": "..."}.
 * contactEndpoint: URL that receives the enquiry form as JSON. "" shows a copyable brief instead.
 *                  Works with the bundled server ("/api/contact") or a form service.
 */
window.MVA_CONFIG={
  apiBase:"/api",
  apiHeaders:{},
  contactEndpoint:"/api/contact"
};
