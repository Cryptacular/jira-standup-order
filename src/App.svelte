<script>
  import { shuffle } from "./lib/shuffle";
  import { getState, setState } from "./lib/localStorage";
  import { isToday } from "./lib/isToday";
  import Person from "./components/Person.svelte";
  import PlusIcon from "./icons/PlusIcon.svelte";
  import ShuffleIcon from "./icons/ShuffleIcon.svelte";
  import ArrowRightIcon from "./icons/ArrowRightIcon.svelte";
  import CheckIcon from "./icons/CheckIcon.svelte";
  import CancelIcon from "./icons/CancelIcon.svelte";
  import NextIcon from "./icons/NextIcon.svelte";
  import PreviousIcon from "./icons/PreviousIcon.svelte";

  let state = getState();
  $: setState(state);
  
  if (!isToday(state.lastShuffled)) {
    shuffleAttendees();
    state.skipped = [];
  }
  
  let isEditing = state.attendees.length === 0;
  let inputField;
  let inputValue = "";

  /**
   * @param {{ preventDefault: () => void; }} e
   */
  function onSave(e) {
    e.preventDefault();
    state.attendees = [...state.attendees, inputValue.trim()]
    state.shuffled = [...state.shuffled, inputValue.trim()]
    inputValue = "";
    inputField.focus();
  }

  function cancelEditMode() {
    isEditing = false;
    inputValue = "";
  }

  function shuffleAttendees() {
    if (state.attendees.length === 0) {
      return;
    }

    const shuffled = shuffle(state.attendees);
    const unskipped = shuffled.filter(s => !state.skipped.some(h => h === s));
    state.shuffled = [...unskipped, ...state.skipped];
    state.lastShuffled = new Date().toISOString();
    state.currentAttendee = unskipped.length > 0 ? unskipped[0] : null;
  }

  function onAddClick() {
    isEditing = true;
    setTimeout(() => {
      inputField.focus();
    }, 100);
  }

  function onNextClick() {
    if (state.currentAttendee === null) {
      state.currentAttendee = state.shuffled[0];
      return;
    }

    const unSkippedAttendees = state.shuffled.filter(s => !state.skipped.some(h => h === s));
    const currentIndex = unSkippedAttendees.indexOf(state.currentAttendee);
    const nextIndex = currentIndex + 1;

    if (nextIndex < unSkippedAttendees.length) {
      state.currentAttendee = unSkippedAttendees[nextIndex];
    } else {
      state.currentAttendee = null;
    }
  }

  function onPreviousClick() {
    const unSkippedAttendees = state.shuffled.filter(s => !state.skipped.some(h => h === s));

    if (state.currentAttendee === null) {
      state.currentAttendee = unSkippedAttendees[unSkippedAttendees.length - 1];
      return;
    }

    const currentIndex = unSkippedAttendees.indexOf(state.currentAttendee);
    const previousIndex = currentIndex - 1;

    if (previousIndex >= 0) {
      state.currentAttendee = unSkippedAttendees[previousIndex];
    } else {
      state.currentAttendee = null;
    }
  }

  /**
   * @param {string} person
   */
  function handleSkip(person) {
    if (!state.skipped?.some((/** @type {string} */ h) => h === person)) {
      state.skipped = [...state.skipped, person]
    }
  }

/**
 * @param {string} person
 */
function handleUnskip(person) {
  if (state.skipped?.some((/** @type {string} */ h) => h === person)) {
    state.skipped = state.skipped.filter((/** @type {string} */ s) => s !== person)
  }
}

  /**
   * @param {string} person
   */
  function handleDelete(person) {
    state.attendees = state.attendees.filter((/** @type {string} */ a) => a !== person);
    state.shuffled = state.shuffled.filter((/** @type {string} */ a) => a !== person);
  }

  /**
   * @param {string} person
   */
  function isSkipped(person) {
    return state.skipped ? state.skipped.some((/** @type {string} */ h) => h === person) : false;
  }

/**
 * @param {string} person
 */
function isCurrent(person) {
  return state.currentAttendee === person;
}
</script>

<div style="margin-top: -4px;">
  <span style="margin-right: 10px; display: inline-flex; align-items: center;">
    {#each state.shuffled as person, i}
      {#if i !== 0}
        <ArrowRightIcon />
      {/if}

      <Person name={person} isCurrent={isCurrent(person)} isSkipped={isSkipped(person)} onSkip={() => handleSkip(person)} onUnskip={() => handleUnskip(person)} onDelete={() => handleDelete(person)} />
    {/each}
  </span>

  {#if !isEditing}
    {#if state.shuffled.length > 0}
      <button class="aui-button" on:click={onNextClick}><NextIcon /></button>
      <button class="aui-button" on:click={onPreviousClick}><PreviousIcon /></button>
      <button class="aui-button" on:click={shuffleAttendees}><ShuffleIcon /></button>
    {/if}
    <button class="aui-button" on:click={onAddClick}><PlusIcon /></button>
  {/if}

  {#if isEditing}
    <form on:submit={onSave}>
      <input placeholder="Name" bind:this={inputField} bind:value={inputValue} style="margin-right: 10px;" />
      <button class="aui-button" type="submit"><CheckIcon /></button>
      <button class="aui-button" on:click={cancelEditMode}><CancelIcon /></button>
    </form>
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

  input {
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
</style>
