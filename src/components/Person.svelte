<script>
    import HideIcon from "../icons/HideIcon.svelte";
    import ShowIcon from "../icons/ShowIcon.svelte";
    import TrashIcon from "../icons/TrashIcon.svelte";

	export let name;
    export let isCurrent;
    export let isSkipped;
    export let onSkip;
    export let onUnskip;
    export let onDelete;

    let hovering = false;

	function enter() {
		hovering = true;
	}

	function leave() {
		hovering = false;
	}
</script>

<span class="container" on:mouseenter={enter} on:mouseleave={leave}>
    <span class={(hovering ? "overlay " : "") + (isSkipped ? "skipped " : "") + (isCurrent ? "current " : "")}>
        {name}
    </span>
    {#if hovering}
        <span class="buttons">
            {#if isSkipped}
                <button class="aui-button" on:click={onUnskip}><ShowIcon /></button>
            {/if}
            {#if !isSkipped}
                <button class="aui-button" on:click={onSkip}><HideIcon /></button>
            {/if}
            <button class="aui-button" on:click={onDelete}><TrashIcon /></button>
        </span>
    {/if}
</span>

<style>
    .container {
        margin: 0 5px;
        position: relative;
    }

    .overlay {
        opacity: 0.5;
    }

    .skipped {
        opacity: 0.2;
        font-style: italic;
        text-decoration: line-through;
    }

    .current {
        font-weight: bold;
    }

    .buttons {
        position: absolute;
        left: 10px;
        top: -17px;
        display: flex;
        flex-direction: column;
    }

    button {
        padding: 0;
        border-radius: 100%;
        display: inline-flex;
        text-align: center;
        justify-content: center;
        padding: 4px 6px !important;
        width: 25px;
        height: 25px;
        margin-left: 0 !important;
        margin-bottom: 6px;
    }
</style>
