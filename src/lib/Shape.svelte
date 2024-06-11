<script lang="ts">
    import { SHAPE, SHAPE2D, decompose_shape} from "./shapes";
    import sphereUrl from "../assets/sphere.svg";
    import cubeUrl from "../assets/cube.svg";
    import cylinderUrl from "../assets/cylinder.svg";
    import coneUrl from "../assets/cone.svg";
    import pyramidUrl from "../assets/pyramid.svg";
    import prismUrl from "../assets/prism.svg";


    export let shape: SHAPE = SHAPE.SPHERE;

    let droppable: boolean = false;

    function drop(ev: DragEvent) {
        ev.preventDefault();
        if (ev.dataTransfer == null || ev.dataTransfer.getData("text") == "") return;
        let data = ev.dataTransfer.getData("text") as SHAPE2D;
        var current = decompose_shape(shape);
        console.log(current, data);
        droppable = false;
    }

    function dragover(ev: DragEvent) {
        ev.preventDefault();
        if (ev.dataTransfer == null) return;
        droppable = true;
    }

    function getShapeImageURL(): string {
        switch (shape) {
            case SHAPE.SPHERE:
                return sphereUrl;
            case SHAPE.CUBE:
                return cubeUrl;
            case SHAPE.CYLINDER:
                return cylinderUrl;
            case SHAPE.CONE:
                return coneUrl;
            case SHAPE.PYRAMID:
                return pyramidUrl;
            case SHAPE.PRISM:
                return prismUrl;
        }
        return "";
    }
</script>

<div on:drop={drop} on:dragover={dragover} on:dragleave={() => droppable = false} role="none" class:drop={droppable}>
    <img width=64 height=64 src={getShapeImageURL()} alt="" />
    <p>{shape}</p>
</div>

<style>
    .drop {
        border: 1px solid gold;
    }
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
    @media (prefers-color-scheme: dark) {
        div {
            border-color: white;
        }
        img {
            filter: invert(1.0);
        }
    }
</style>