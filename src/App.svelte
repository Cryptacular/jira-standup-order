<script>
  import { onDestroy, onMount } from "svelte";
  import { v4, v5 } from "uuid";
  import { shuffleV2 } from "./lib/shuffle";
  import { getState, setState } from "./lib/state";
  import { isToday } from "./lib/isToday";
  import Person from "./components/Person.svelte";
  import PlusIcon from "./icons/PlusIcon.svelte";
  import ShuffleIcon from "./icons/ShuffleIcon.svelte";
  import ArrowRightIcon from "./icons/ArrowRightIcon.svelte";
  import CheckIcon from "./icons/CheckIcon.svelte";
  import CancelIcon from "./icons/CancelIcon.svelte";
  import NextIcon from "./icons/NextIcon.svelte";
  import PreviousIcon from "./icons/PreviousIcon.svelte";
  import HideIcon from "./icons/HideIcon.svelte";
  import CogIcon from "./icons/CogIcon.svelte";
  import { getConfig, setConfig } from "./lib/config";
  import {
    subscribe,
    trackCurrentAttendee,
    trackStateChanged,
    unsubscribe,
  } from "./lib/realtime/broadcast";
  import Spinner from "./components/Spinner.svelte";
  import ShowIcon from "./icons/ShowIcon.svelte";

  const projectId = getId();
  let isLoading = true;
  let state = null;
  let shuffledAttendeesViewModel = null;
  let inputField;
  let inputValue = "";
  let isEditing = false;
  let isExpanded = false;
  let shouldSyncWithServerCheckbox = false;
  let isShuffleDisabled = false;
  let currentAttendee = null;

  onMount(async () => {
    const config = await getConfig();
    const loadedState = await getState(projectId, config.shouldSyncWithServer);

    shouldSyncWithServerCheckbox = config.shouldSyncWithServer;
    state = loadedState;

    if (!isToday(state?.lastShuffled)) {
      state = {
        ...state,
        attendees: state?.attendees.map((a) => ({ ...a, isSkipped: false })),
      };
      shuffleAttendees();
    }

    isEditing = state?.attendees?.length === 0;
    isLoading = false;

    if (config.shouldSyncWithServer) {
      subscribeToChanges();
    }
  });

  onDestroy(async () => {
    await unsubscribeFromChanges();
  });

  $: {
    (async () => {
      const config = await getConfig();

      if (
        shouldSyncWithServerCheckbox !== config.shouldSyncWithServer &&
        !isLoading
      ) {
        isLoading = true;
        state = await getState(projectId, shouldSyncWithServerCheckbox);
        isLoading = false;

        if (shouldSyncWithServerCheckbox) {
          await subscribeToChanges();
        } else {
          await unsubscribeFromChanges();
        }
      }

      await setConfig({
        ...config,
        shouldSyncWithServer: shouldSyncWithServerCheckbox,
      });
    })();
  }

  $: if (state) {
    shuffledAttendeesViewModel = getShuffledAttendees(state);
    setState(projectId, state, shouldSyncWithServerCheckbox);
  }

  /**
   * @param {import("./models/StateV2").default} state
   */
  function getShuffledAttendees(state) {
    return state.shuffled.map((s) => state.attendees.find((a) => a.id === s));
  }

  /**
   * @param {{ preventDefault: () => void; }} e
   */
  function onSave(e) {
    e.preventDefault();
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      inputField.focus();
      return;
    }

    const newAttendee = { id: v4(), name: trimmedValue, isSkipped: false };

    state = {
      ...state,
      attendees: [...state.attendees, newAttendee],
      shuffled: [...state.shuffled, newAttendee.id],
    };

    inputValue = "";
    inputField.focus();

    trackStateChanged(projectId);
  }

  function cancelEditMode() {
    isEditing = false;
    inputValue = "";
  }

  function shuffleAttendees() {
    if (!state?.attendees || state.attendees.length === 0) {
      return;
    }

    const shuffled = shuffleV2(state.attendees);
    const skipped = shuffled.filter((s) => s.isSkipped).map((s) => s.id);
    const unskipped = shuffled.filter((s) => !s.isSkipped).map((s) => s.id);

    state = {
      ...state,
      shuffled: [...unskipped, ...skipped],
      lastShuffled: new Date().toISOString(),
    };
    currentAttendee = unskipped.length > 0 ? 0 : null;
    trackStateChanged(projectId);
    trackCurrentAttendee(projectId, currentAttendee);
  }

  function onAddClick() {
    isEditing = true;
    setTimeout(() => {
      inputField.focus();
    }, 100);
  }

  function onNextClick() {
    const firstIndex = currentAttendee === null ? 0 : currentAttendee + 1;

    for (let i = firstIndex; i < state.shuffled.length; i++) {
      const nextAttendee = state.attendees.find(
        (x) => x.id === state.shuffled[i]
      );

      if (!nextAttendee.isSkipped) {
        state = { ...state };
        currentAttendee = i;
        trackCurrentAttendee(projectId, currentAttendee);
        return;
      }
    }

    state = { ...state };
    currentAttendee = null;
    trackCurrentAttendee(projectId, currentAttendee);
  }

  function onPreviousClick() {
    const firstIndex =
      currentAttendee === null
        ? state.shuffled.length - 1
        : currentAttendee - 1;

    for (let i = firstIndex; i >= 0; i--) {
      const prevAttendee = state.attendees.find(
        (x) => x.id === state.shuffled[i]
      );

      if (!prevAttendee.isSkipped) {
        state = { ...state };
        currentAttendee = i;
        trackCurrentAttendee(projectId, currentAttendee);
        return;
      }
    }

    state = { ...state };
    currentAttendee = null;
    trackCurrentAttendee(projectId, currentAttendee);
  }

  function onShuffleClick() {
    if (currentAttendee > 0) {
      const shouldShuffle = confirm("Are you sure you want to shuffle?");
      if (!shouldShuffle) return;
    }

    shuffleAttendees();
    isShuffleDisabled = true;
    setTimeout(() => {
      isShuffleDisabled = false;
    }, 500);
  }

  /**
   * @param {import("./models/Id").default} userId
   */
  function handleSkip(userId) {
    state = {
      ...state,
      attendees: state.attendees.map((a) =>
        a.id === userId ? { ...a, isSkipped: true } : a
      ),
    };
    state.shuffled.push(
      state.shuffled.splice(state.shuffled.indexOf(userId), 1)[0]
    );
    trackStateChanged(projectId);
  }

  /**
   * @param {import("./models/Id").default} userId
   */
  function handleUnskip(userId) {
    state = {
      ...state,
      attendees: state.attendees.map((a) =>
        a.id === userId ? { ...a, isSkipped: false } : a
      ),
    };

    const currIndex = state.shuffled.indexOf(userId);
    const newIndex = state.shuffled.findIndex((sid) => {
      return (
        state.attendees.find((a) => a.id === sid && a.isSkipped) !== undefined
      );
    });

    if (newIndex !== currIndex + 1) {
      state.shuffled.splice(
        newIndex < 0 ? state.shuffled.length - 1 : newIndex,
        0,
        state.shuffled.splice(currIndex, 1)[0]
      );
    }

    trackStateChanged(projectId);
  }

  /**
   * @param {import("./models/Id").default} userId
   */
  function handleDelete(userId) {
    state = {
      ...state,
      attendees: state.attendees.filter((a) => a.id !== userId),
      shuffled: state.shuffled.filter((s) => s !== userId),
    };
    trackStateChanged(projectId);
  }

  /**
   * @param {import("./models/Id").default} userId
   */
  function isCurrent(userId) {
    return (
      state.shuffled[currentAttendee] ===
      state.attendees.find((a) => a.id === userId)?.id
    );
  }

  function getId() {
    const pathSegments = window.location.pathname.split("/");
    const boardsIndex = pathSegments.indexOf("boards");

    if (boardsIndex <= 0) {
      throw new Error("Unexpected JIRA URL");
    }

    const jiraProject = pathSegments[boardsIndex - 1];
    const jiraBoard = pathSegments[boardsIndex + 1];

    return v5(
      `${jiraProject}/${jiraBoard}`,
      "e5241f0e-bab5-4d37-a9a1-20bd464766cb"
    );
  }

  async function subscribeToChanges() {
    if (!projectId) return;

    await subscribe(projectId, async (event, newState) => {
      if (event === "currentAttendeeChanged") {
        currentAttendee = newState.currentAttendee;
        state = state;
      }

      if (event === "stateChanged") {
        isLoading = true;
        state = await getState(projectId, shouldSyncWithServerCheckbox);
        isLoading = false;
      }
    });
  }

  async function unsubscribeFromChanges() {
    if (!projectId) return;

    await unsubscribe(projectId);
  }

  function onShowHideClick() {
    isExpanded = !isExpanded;
  }
</script>

<div class="jira-standup-container">
  {#if !isExpanded}
    🕴️ Jira Standup Order
    <button class="aui-button" on:click={onShowHideClick}><ShowIcon /></button>
  {/if}

  {#if isExpanded}
    {#if state !== null}
      <span class="jira-standup-attendees">
        {#if shuffledAttendeesViewModel.length === 0}
          <em>Standup order is empty</em>
        {/if}

        {#each shuffledAttendeesViewModel as person, i}
          {#if i !== 0}
            <ArrowRightIcon />
          {/if}

          <Person
            name={person.name}
            isCurrent={isCurrent(person.id)}
            isSkipped={person.isSkipped}
            onSkip={() => handleSkip(person.id)}
            onUnskip={() => handleUnskip(person.id)}
            onDelete={() => handleDelete(person.id)}
          />
        {/each}
      </span>

      <div>
        {#if state.shuffled.length > 0}
          <button class="aui-button" on:click={onPreviousClick}
            ><PreviousIcon /></button
          >
          <button class="aui-button" on:click={onNextClick}><NextIcon /></button
          >
          <button
            class="aui-button"
            on:click={onShuffleClick}
            disabled={isShuffleDisabled}><ShuffleIcon /></button
          >
        {/if}
        <button
          class="aui-button"
          on:click={isEditing ? cancelEditMode : onAddClick}><CogIcon /></button
        >

        <button class="aui-button" on:click={onShowHideClick}
          ><HideIcon /></button
        >
      </div>

      {#if isEditing}
        <form on:submit={onSave} class="jira-standup-form">
          <input
            class="input-field"
            placeholder="Name"
            bind:this={inputField}
            bind:value={inputValue}
          />
          <button class="aui-button" type="submit"><CheckIcon /></button>
          <button class="aui-button" on:click={cancelEditMode}
            ><CancelIcon /></button
          >
        </form>
      {/if}

      <div class="jira-standup-sync">
        <input
          bind:checked={shouldSyncWithServerCheckbox}
          type="checkbox"
          id="shouldSync"
        />
        <label for="shouldSync"> Sync? </label>
      </div>
    {/if}

    {#if isLoading}
      <Spinner />
    {/if}
  {/if}
</div>

<style>
  .jira-standup-form {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    background: rgb(247, 248, 249);
    padding: 4px 8px;
    border-radius: 3px;
  }

  .jira-standup-form input,
  .jira-standup-form button {
    margin: 0;
  }

  button {
    margin-left: 0;
    padding-left: 10px !important;
    padding-right: 10px !important;
    font-weight: 500;
  }

  .jira-standup-container {
    margin-top: -4px;
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .jira-standup-attendees {
    align-items: center;
    white-space: normal;
  }

  .input-field {
    padding: 8px 6px;
    background-color: #fafbfc;
    border-color: #dfe1e6;
    color: #091e42;
    border-radius: 3px;
    border-width: 2px;
    border-style: solid;
    margin-right: 10px;
    width: 50px;
  }

  .jira-standup-sync {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
  }

  .jira-standup-spinner {
    display: flex;
  }
</style>
