<script lang="ts">
    import { SHAPE, SHAPE2D, decompose_shape } from "./shapes";

    import circleUrl from "../assets/circle.svg";
    import squareUrl from "../assets/square.svg";
    import triangleUrl from "../assets/triangle.svg";

    function get2dURL() {
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

<div draggable={draggable} on:dragstart={dragStart} role="none">
    <img width=64 height=64 src={get2dURL()} alt="" draggable="false" />
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        border: 1px solid black;
        border-radius: 0.5rem;
        margin: 0.5rem;
    }
</style>