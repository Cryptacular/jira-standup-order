import App from "./App.svelte";

const isDev = import.meta.env.DEV;
let hasInitialised = false;

const isOnJiraBoard = (): boolean => {
  const regex = new RegExp(
    /^\/jira\/software\/c\/projects\/\w+\/boards\/\d+$/g
  );
  return regex.test(window.location.pathname);
};

const isPageReady = (): boolean => {
  const quickFiltersList = document.querySelector("#ghx-quick-filters > ul");
  return !!quickFiltersList;
};

const jiraStandupOrderContainerId = "jiraStandupOrderContainer";

const init = (): void => {
  const quickFiltersList = document.querySelector("#ghx-quick-filters > ul");
  const listItem = document.createElement("li");
  listItem.id = jiraStandupOrderContainerId;
  quickFiltersList.appendChild(listItem);
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
