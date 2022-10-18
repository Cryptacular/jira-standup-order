let hasInitialised = false;

const shuffle = (array) => {
  const out = [...array];

  let currentIndex = out.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [out[currentIndex], out[randomIndex]] = [
      out[randomIndex],
      out[currentIndex],
    ];
  }

  return out;
};

const createButton = (text, onClick, type) => {
  const button = document.createElement("button");
  button.className = "aui-button";
  button.innerText = text;
  button.style = "padding-left: 10px; padding-right: 10px; font-weight: 500;";

  if (onClick) {
    button.onclick = onClick;
  }

  if (type) {
    button.type = type;
  }

  return button;
};

const createPeopleContainer = (people) => {
  const container = document.createElement("span");
  if (people?.length === 0) {
    return container;
  }
  container.style = "margin-right: 10px;";
  container.innerText = people.join(" → ");
  return container;
};

const isSameDayOfYear = (dateString1, dateString2) => {
  if (!dateString1 || !dateString2) {
    return false;
  }

  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);

  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const jiraStandupOrderContainerId = "jiraStandupOrderContainer";

const { getState, setState } = (() => {
  const localStorageKey = "jiraStandupOrder";
  const savedState = localStorage.getItem(localStorageKey);

  let state = savedState
    ? JSON.parse(savedState)
    : {
        attendees: [],
        shuffled: [],
        lastShuffled: null,
        mode: "read",
      };

  if (!isSameDayOfYear(state.lastShuffled, new Date().toISOString())) {
    state.shuffled = shuffle(state.attendees);
    state.lastShuffled = new Date().toISOString();
  }

  localStorage.setItem(localStorageKey, JSON.stringify(state));

  return {
    getState: () => ({ ...state }),
    setState: (s) => {
      state = { ...state, ...s };
      if (s.shuffled) {
        state.lastShuffled = new Date().toISOString();
      }
      localStorage.setItem(localStorageKey, JSON.stringify(state));
      render();
    },
  };
})();

const isOnJiraBoard = () => {
  const regex = new RegExp(
    /^\/jira\/software\/c\/projects\/\w+\/boards\/\d+$/g
  );
  return regex.test(window.location.pathname);
};

const isPageReady = () => {
  const quickFiltersList = document.querySelector("#ghx-quick-filters > ul");
  return !!quickFiltersList;
};

const init = () => {
  const quickFiltersList = document.querySelector("#ghx-quick-filters > ul");
  const listItem = document.createElement("li");
  listItem.style = "margin-top: 0;";
  const jiraStandupOrderContainer = document.createElement("div");
  jiraStandupOrderContainer.id = jiraStandupOrderContainerId;
  listItem.appendChild(jiraStandupOrderContainer);
  quickFiltersList.appendChild(listItem);
  hasInitialised = true;
};

const render = () => {
  const elements = [];

  const label = document.createElement("span");
  label.innerText = "🕴";
  label.style = "margin-right: 10px; font-size: 18px;";
  elements.push(label);

  const state = getState();

  if (state.mode === "read") {
    if (state.attendees.length > 0) {
      const peopleContainer = createPeopleContainer(state.shuffled);

      const shuffleButton = createButton("Shuffle", () => {
        const shuffled = shuffle(state.attendees);
        setState({ shuffled });
      });

      elements.push(peopleContainer, shuffleButton);
    }

    const editButton = createButton("✏️", () => setState({ mode: "edit" }));
    elements.push(editButton);
  } else {
    const form = document.createElement("form");
    form.style = "display: inline;";

    const inputField = document.createElement("input");
    inputField.id = "jiraStandupOrderInput";
    inputField.placeholder = "Comma-separated list of people";
    inputField.value = state.attendees.join(", ");
    inputField.style = `padding: 8px 6px; 
    background-color: #FAFBFC;
    border-color: #DFE1E6;
    color: #091E42;
    border-radius: 3px;
    border-width: 2px;
    border-style: solid;
    margin-right: 10px;
    width: 200px;`;

    const saveButton = createButton(
      "Save",
      () => {
        const attendees =
          inputField.value?.split(",").map((x) => x.trim()) || [];
        setState({
          attendees,
          shuffled: shuffle(attendees),
          mode: "read",
        });
      },
      "submit"
    );

    form.appendChild(inputField);
    form.appendChild(saveButton);

    elements.push(form);
  }

  const jiraStandupOrderContainer = document.getElementById(
    jiraStandupOrderContainerId
  );
  jiraStandupOrderContainer.replaceChildren(...elements);
};

const jiraBoardIntervalId = setInterval(() => {
  if (isOnJiraBoard()) {
    if (isPageReady() && !hasInitialised) {
      setTimeout(() => {
        init();
        render();
      }, 500);
    }
  } else {
    hasInitialised = false;
  }
}, 500);
