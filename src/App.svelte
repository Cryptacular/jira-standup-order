<script>
  import { onMount } from "svelte";
  import { v4, v5 } from "uuid";
  import { Circle } from 'svelte-loading-spinners';
  import { shuffle } from "./lib/shuffle";
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
  import { getConfig, setConfig } from "./lib/config";

  const id = getId();
  let isLoading = true;
  let state = null
  let shuffledAttendeesViewModel = null;
  let inputField;
  let inputValue = "";
  let isEditing = false
  let shouldSyncWithServerCheckbox = false;

  onMount(async () => {
    const config = await getConfig();
    const loadedState = await getState(id, config.shouldSyncWithServer);
    
    shouldSyncWithServerCheckbox = config.shouldSyncWithServer;
    state = loadedState;

    if (!isToday(state?.lastShuffled)) {
      state = {...state, attendees: state?.attendees.map(a => ({...a, isSkipped: false})) }
      shuffleAttendees();
    }

    isEditing = state?.attendees?.length === 0;
    isLoading = false;
  });

  $: {
    (async () => {
      const config = await getConfig();
      
      if (shouldSyncWithServerCheckbox !== config.shouldSyncWithServer && !isLoading) {
        isLoading = true;
        state = await getState(id, shouldSyncWithServerCheckbox);
        isLoading = false;
      }

      await setConfig({...config, shouldSyncWithServer: shouldSyncWithServerCheckbox})
    })()
  }
  
  $: if (state) {
    shuffledAttendeesViewModel = getShuffledAttendees(state);
    setState(id, state, shouldSyncWithServerCheckbox)
  }

  /**
   * @param {import("./models/StateV2").default} state
   */
  function getShuffledAttendees(state) {
    return state.shuffled.map(s => state.attendees.find(a => a.id === s));
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

    const newAttendee = {id: v4(), name: trimmedValue, isSkipped: false};

    state = {
      ...state,
      attendees: [...state.attendees, newAttendee],
      shuffled: [...state.shuffled, newAttendee.id]
    };

    inputValue = "";
    inputField.focus();
  }

  function cancelEditMode() {
    isEditing = false;
    inputValue = "";
  }

  function shuffleAttendees() {
    if (!state?.attendees || state.attendees.length === 0) {
      return;
    }

    const shuffled = shuffle(state.attendees);
    const skipped = shuffled.filter(s => s.isSkipped).map(s => s.id);
    const unskipped = shuffled.filter(s => !s.isSkipped).map(s => s.id);

    state = {...state, shuffled: [...unskipped, ...skipped], lastShuffled: new Date().toISOString(), currentAttendee: unskipped.length > 0 ? 0 : null}
  }

  function onAddClick() {
    isEditing = true;
    setTimeout(() => {
      inputField.focus();
    }, 100);
  }

  function onNextClick() {
    const firstIndex = state.currentAttendee === null ? 0 : (state.currentAttendee + 1);

    for (let i = firstIndex; i < state.shuffled.length; i++) {
      const nextAttendee = state.attendees.find(x => x.id === state.shuffled[i]);

      if (!nextAttendee.isSkipped) {
        state = {...state, currentAttendee: i };
        return;
      }
    }

    state = {...state, currentAttendee: null };
  }

  function onPreviousClick() {
    const firstIndex = state.currentAttendee === null ? state.shuffled.length - 1 : (state.currentAttendee - 1);

    for (let i = firstIndex; i >= 0; i--) {
      const prevAttendee = state.attendees.find(x => x.id === state.shuffled[i]);

      if (!prevAttendee.isSkipped) {
        state.currentAttendee = i;
        return;
      }
    }

    state = {...state, currentAttendee: null };
  }

  /**
   * @param {import("./models/Id").default} id
   */
  function handleSkip(id) {
    state = {...state, attendees: state.attendees.map(a => a.id === id ? {...a, isSkipped: true} : a) };
  }

  /**
   * @param {import("./models/Id").default} id
   */
  function handleUnskip(id) {
    state = {...state, attendees: state.attendees.map(a => a.id === id ? {...a, isSkipped: false} : a) };
  }

  /**
   * @param {import("./models/Id").default} id
   */
  function handleDelete(id) {
    state = {
      ...state,
      attendees: state.attendees.filter((a) => a.id !== id),
      shuffled: state.shuffled.filter(s => s !== id)
    };
  }

  /**
   * @param {import("./models/Id").default} id
   */
  function isCurrent(id) {
    return state.shuffled[state.currentAttendee] === state.attendees.find(a => a.id === id)?.id
  }

  function getId() {
    const pathSegments = window.location.pathname.split("/");
    const boardsIndex = pathSegments.indexOf("boards");

    if (boardsIndex <= 0) {
      throw new Error("Unexpected JIRA URL");
    }

    const jiraProject = pathSegments[boardsIndex - 1];
    const jiraBoard = pathSegments[boardsIndex + 1];

    return v5(`${jiraProject}/${jiraBoard}`, "e5241f0e-bab5-4d37-a9a1-20bd464766cb");
  }
</script>

<div class="jira-standup-container">
  {#if state !== null}
    <span style="display: inline-flex; align-items: center;">
      {#if state.shuffled.length === 0}
        <em>Standup order is empty</em>
      {/if}

      {#each shuffledAttendeesViewModel as person, i}
        {#if i !== 0}
          <ArrowRightIcon />
        {/if}

        <Person name={person.name} isCurrent={isCurrent(person.id)} isSkipped={person.isSkipped} onSkip={() => handleSkip(person.id)} onUnskip={() => handleUnskip(person.id)} onDelete={() => handleDelete(person.id)} />
      {/each}
    </span>

    <div>
      {#if !isEditing}
        {#if state.shuffled.length > 0}
          <button class="aui-button" on:click={onPreviousClick}><PreviousIcon /></button>
          <button class="aui-button" on:click={onNextClick}><NextIcon /></button>
          <button class="aui-button" on:click={shuffleAttendees}><ShuffleIcon /></button>
        {/if}
        <button class="aui-button" on:click={onAddClick}><PlusIcon /></button>
      {/if}
    </div>

    {#if isEditing}
      <form on:submit={onSave}>
        <input class="input-field" placeholder="Name" bind:this={inputField} bind:value={inputValue} style="margin-right: 10px;" />
        <button class="aui-button" type="submit"><CheckIcon /></button>
        <button class="aui-button" on:click={cancelEditMode}><CancelIcon /></button>
      </form>
    {/if}

    <input bind:checked={shouldSyncWithServerCheckbox} type="checkbox" id="shouldSync"/>
    <label for="shouldSync">
      Sync?
    </label>
  {/if}

  {#if isLoading}
    <span class="spinner"><Circle size="20" color="#626F86" unit="px" duration="1s" /></span>
  {/if}
</div>

<style>
  form {
    display: inline;
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

  .input-field {
    padding: 8px 6px; 
    background-color: #FAFBFC;
    border-color: #DFE1E6;
    color: #091E42;
    border-radius: 3px;
    border-width: 2px;
    border-style: solid;
    margin-right: 10px;
    width: 50px;
  }

  .spinner {
    display: flex;
  }
</style>
