<script lang="ts">
    import { SHAPE, SHAPE2D, decompose_shape } from "./shapes";
    import { createEventDispatcher } from "svelte";

    import circleUrl from "../assets/circle.svg";
    import squareUrl from "../assets/square.svg";
    import triangleUrl from "../assets/triangle.svg";

    const dispatcher = createEventDispatcher<{shapedragstart: SHAPE2D}>();

    function get2DURL(shape: SHAPE2D) {
        switch (shape) {
            case SHAPE2D.CIRCLE:
                return circleUrl;
            case SHAPE2D.SQUARE:
                return squareUrl;
            case SHAPE2D.TRIANGLE:
                return triangleUrl;
        }
        return "";
    }

    export let shape: SHAPE2D = SHAPE2D.CIRCLE;
    export let border: boolean = true;
    export let width = 64;
    export let height = 64;
    export let padding = true;
    export let image = true;
    export let disabled = false;
    export let invalid = false;

    export let draggable: boolean = true;

    function dragStart(ev: DragEvent) {
        if (!draggable || disabled) return;
        if (ev.dataTransfer == null) return;
        ev.dataTransfer!.clearData();
        ev.dataTransfer!.setData("text", shape);
        ev.dataTransfer!.effectAllowed = 'move';
        dispatcher("shapedragstart", shape);

        console.log("Sent:", ev);
    }
</script>

{#if image} 
<div draggable={draggable && !disabled} on:dragstart={dragStart} role="none" class:border={border} class:padding={padding} class:disabled={disabled} class:draggable={draggable}>
    <img class:invalid={invalid} {width} {height} src={get2DURL(shape)} alt="" draggable="false" />
</div>
{:else}
<div draggable={draggable} on:dragstart={dragStart} role="none" class:border={border} class:padding={padding} class:draggable={draggable}>
    <div style:width={width + "px"} style:height={height + "px"} class="text">
        {shape.charAt(0).toUpperCase()}
    </div>
</div>
{/if}

<style>
    .disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .text {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
    }
    div:not(.text) {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        margin: 0.5rem;
    }
    .padding {
        padding: 1rem;
    }
    div.border {
        border: 1px solid black;
    }

    .invalid {
        filter: invert(33%) sepia(83%) saturate(5171%) hue-rotate(348deg) brightness(86%) contrast(141%);
    }

    .draggable:not(.disabled) {
        cursor: move;
    }

    @media (prefers-color-scheme: dark) {
        div.border {
            border-color: white;
        }
        img {
            filter: invert(1.0);
        }
    }
</style>
