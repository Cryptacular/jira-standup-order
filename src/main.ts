import App from "./App.svelte";

const isDev = import.meta.env.DEV;
let hasInitialised = false;

const isOnJiraBoard = (): boolean => {
  const regex = new RegExp(
    /^\/jira\/software\/c\/projects\/\w+\/boards\/\d+$/g
  );
  return regex.test(window.location.pathname);
};

const getQuickFiltersList = () =>
  document.querySelector("#ghx-quick-filters > ul") ??
  document.querySelector(
    "[data-testid='software-filters.ui.list-filter-container']"
  );

const isPageReady = (): boolean => {
  const quickFiltersList = getQuickFiltersList();
  return !!quickFiltersList;
};

const jiraStandupOrderContainerId = "jiraStandupOrderContainer";

const init = (): void => {
  const quickFiltersList = getQuickFiltersList();
  quickFiltersList.classList.add("jira-standup-parent-container");

  const container = document.createElement("div");
  container.id = jiraStandupOrderContainerId;
  quickFiltersList.appendChild(container);
};

if (isDev) {
  new App({
    target: document.getElementById("app"),
  });
} else {
  setInterval(() => {
    if (isOnJiraBoard()) {
      if (isPageReady() && !hasInitialised) {
        hasInitialised = true;
        setTimeout(() => {
          init();
          new App({
            target: document.getElementById(jiraStandupOrderContainerId),
          });
        }, 500);
      }
    } else {
      hasInitialised = false;
    }
  }, 500);
}
