<script>
  import { shuffle } from "./lib/shuffle";
  import { getState, setState } from "./lib/localStorage";
  import { isToday } from "./lib/isToday";

  let state = getState();
  $: setState(state);

  if (!isToday(state.lastShuffled)) {
    shuffleAttendees();
  }

  let inputValue = state.attendees.join(", ");

  function onSave(e) {
    e.preventDefault();
    state.attendees = inputValue.split(",").map((x) => x.trim()) || [];
    shuffleAttendees();
    state.isEditing = false;
  }

  function shuffleAttendees() {
    state.shuffled = shuffle(state.attendees);
    state.lastShuffled = new Date().toISOString();
  }

  function onEditClick() {
    state.isEditing = true;
  }
</script>

<div style="margin-top: -4px;">
<span style="margin-right: 10px; font-size: 18px;">🕴</span>

{#if state.isEditing}
  <form on:submit={onSave}>
    <input placeholder="Comma-separated list of people" bind:value={inputValue} style="margin-right: 10px;" />
  <button class="aui-button" type="submit">Save</button>
  </form>
{/if}

{#if !state.isEditing}
  <span style="margin-right: 10px;">{state.shuffled.join(' → ')}</span>
    <button class="aui-button" on:click={shuffleAttendees}>🔀</button>
  <button class="aui-button" on:click={onEditClick}>✏️</button>
{/if}
</div>

<style>
  form {
    display: inline;
  }

  button {
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
    width: 200px;
  }
</style>