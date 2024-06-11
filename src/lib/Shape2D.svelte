<script lang="ts">
    import { SHAPE, SHAPE2D, decompose_shape } from "./shapes";

    import circleUrl from "../assets/circle.svg";
    import squareUrl from "../assets/square.svg";
    import triangleUrl from "../assets/triangle.svg";

    function get2DURL() {
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

    let draggable: boolean = true;

    function dragStart(ev: DragEvent) {
        if (!draggable) return;
        if (ev.dataTransfer == null) return;
        ev.dataTransfer!.clearData();
        ev.dataTransfer!.setData("text", shape);
        ev.dataTransfer!.effectAllowed = 'move';
        console.log("Sent:", ev);
    }
</script>

<div draggable={draggable} on:dragstart={dragStart} role="none" class:border={border}>
    <img width=64 height=64 src={get2DURL()} alt="" draggable="false" />
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem;
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