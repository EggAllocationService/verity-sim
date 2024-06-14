<script lang="ts">
    import { SHAPE, SHAPE2D, decompose_shape } from "./shapes";

    import circleUrl from "../assets/circle.svg";
    import squareUrl from "../assets/square.svg";
    import triangleUrl from "../assets/triangle.svg";

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

    export let draggable: boolean = true;

    function dragStart(ev: DragEvent) {
        if (!draggable) return;
        if (ev.dataTransfer == null) return;
        ev.dataTransfer!.clearData();
        ev.dataTransfer!.setData("text", shape);
        ev.dataTransfer!.effectAllowed = 'move';
        console.log("Sent:", ev);
    }
</script>

{#if image} 
<div draggable={draggable} on:dragstart={dragStart} role="none" class:border={border} class:padding={padding}>
    <img {width} {height} src={get2DURL(shape)} alt="" draggable="false" />
</div>
{:else}
<div draggable={draggable} on:dragstart={dragStart} role="none" class:border={border} class:padding={padding}>
    <div style:width={width + "px"} style:height={height + "px"} class="text">
        {shape.charAt(0).toUpperCase()}
    </div>
</div>
{/if}

<style>
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

    @media (prefers-color-scheme: dark) {
        div.border {
            border-color: white;
        }
        img {
            filter: invert(1.0);
        }
    }
</style>