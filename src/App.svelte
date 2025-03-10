<script lang="ts">
  import Shape from "./lib/Shape.svelte";
  import Shape2D from "./lib/Shape2D.svelte";
  import {
    SHAPE2D,
    SHAPE,
    construct_shape_from_2d,
    decompose_shape,
  } from "./lib/shapes";
  import { remove_one_item_from_array } from "./lib/util";
  import puzzleJson from "./assets/puzzles.json"
    import DismissablePopup from "./lib/DismissablePopup.svelte";
    import Tooltip from "./lib/Tooltip.svelte";

  type Puzzle = {
      inside: {
          left: SHAPE2D,
          mid: SHAPE2D,
          right: SHAPE2D
          
      },
      outside: {
          left: SHAPE,
          mid: SHAPE,
          right: SHAPE
      
      }
  }
  const puzzles: Puzzle[] = puzzleJson as Puzzle[];

  enum SelectedSlot {
    LEFT = "left",
    MID = "mid",
    RIGHT = "right",
  }
  type Callouts = { left: SHAPE2D; mid: SHAPE2D; right: SHAPE2D };
  type PuzzleState = {
    left: SHAPE;
    mid: SHAPE;
    right: SHAPE;
    selected: { slot: SelectedSlot; shape: SHAPE2D } | null;
  };

  let calls: Callouts;
  let state: PuzzleState;
  randomize();
  let num_swaps: number = 0;
  let is_complete: boolean = false;
  let start_time: number = Date.now();
  let show_hints = window.localStorage.getItem("show_hints") === "true";
  let use_image_callouts = (window.localStorage.getItem("use_image_callouts") === "true") || true;
  let use_realistic_drops = window.localStorage.getItem("use_realistic_drops") === "true";
  let challenge_mode = window.localStorage.getItem("challenge_mode") === "true";
  $: {
    window.localStorage.setItem("show_hints", show_hints.toString());
    window.localStorage.setItem("use_image_callouts", use_image_callouts.toString());
    window.localStorage.setItem("use_realistic_drops", use_realistic_drops.toString());
    window.localStorage.setItem("challenge_mode", challenge_mode.toString());

  }
  let challenge_things: {left: SHAPE, mid: SHAPE, right: SHAPE} = {
    left: SHAPE.SPHERE,
    mid: SHAPE.CUBE,
    right: SHAPE.CYLINDER
  }
  $: {
    if (!use_realistic_drops) {
      disabled = {left: false, mid: false, right: false};
    }
  }
  $: {
    challenge_things.left = construct_shape_from_2d(calls.right, calls.right);
    challenge_things.mid = construct_shape_from_2d(calls.left, calls.left);
    challenge_things.right = construct_shape_from_2d(calls.mid, calls.mid);
  }

  function randomize() {
    var i = Math.floor(Math.random() * puzzles.length);
    calls = {
      left: puzzles[i].inside.left,
      mid: puzzles[i].inside.mid,
      right: puzzles[i].inside.right,
    };
    state = {
      left: puzzles[i].outside.left,
      mid: puzzles[i].outside.mid,
      right: puzzles[i].outside.right,
      selected: null,
    };
  }

  function isComplete(state: PuzzleState, calls: Callouts): boolean {
    if (challenge_mode) {
      return (
        state.left == challenge_things.left &&
        state.mid == challenge_things.mid &&
        state.right == challenge_things.right
      );
    }
    // check that for each slot, the 2d shape plus the decomposed 3d shape is all three 2d shapes
    let left = decompose_shape(state.left);
    let mid = decompose_shape(state.mid);
    let right = decompose_shape(state.right);
    return (
      !left.includes(calls.left) &&
      !mid.includes(calls.mid) &&
      !right.includes(calls.right)
    );
  }

  function onDropped(slot: SelectedSlot): (ev: CustomEvent<SHAPE2D>) => void {
    return (event) => {
      let shape = event.detail;
      let newState = { ...state };
      let existing: SHAPE2D[] = decompose_shape(newState[slot]);
      if (!existing.includes(shape)) {
        // Symbol not placed in right slot
        return;
      }
      if (newState.selected?.slot == slot) return; // selecting same slot dont work
      if (use_realistic_drops) {
        if (event.detail == SHAPE2D.CIRCLE) {
          disabled.left = true;
        } else if (event.detail == SHAPE2D.TRIANGLE) {
          disabled.mid = true;
        } else {
          disabled.right = true;
        }
        if (disabled.left && disabled.mid && disabled.right) {
          disabled = {left: false, mid: false, right: false};
        }
      }
      
      if (newState.selected == null) {
        // select this slot
        newState.selected = { slot, shape };
      } else {
        // decompose
        let sA: SHAPE2D[] = decompose_shape(newState[newState.selected.slot]); // selected
        let sB: SHAPE2D[] = decompose_shape(newState[slot]); // dropped

        // remove slected shape from selected slot
        sA = remove_one_item_from_array(sA, newState.selected.shape);
        // remove dropped shape from dropped slot
        sB = remove_one_item_from_array(sB, shape);

        // add selected shape to dropped slot
        sB.push(newState.selected.shape);
        // add dropped shape to selected slot
        sA.push(shape);

        // reconstruct objects
        newState[newState.selected.slot] = construct_shape_from_2d(
          sA[0],
          sA[1],
        );
        newState[slot] = construct_shape_from_2d(sB[0], sB[1]);
        newState.selected = null;
        num_swaps++;
      }
      setTimeout(() => {
        state = newState;
        is_complete = isComplete(state, calls);
      }, 10);
    };
  }
  let disabled: {left: boolean, mid: boolean, right: boolean} = {left: false, mid: false, right: false};

  function reset() {
    randomize();
    num_swaps = 0;
    is_complete = false;
    start_time = Date.now();
    disabled = {left: false, mid: false, right: false};
  }
  import helpurl from "./assets/question.svg";
    import FoldRegion from "./lib/FoldRegion.svelte";
    import ghLogo from "./assets/github-mark.svg"
</script>

<main>
  <div class="callouts">
    <h2>Inside Callouts</h2>
    <FoldRegion title="Settings" speed={150} dots={[show_hints, use_image_callouts, challenge_mode, use_realistic_drops]}>
      <div style="display: flex; flex-direction: column">
        <span>
          <label for="hints">Show hints: </label>
          <input type="checkbox" bind:checked={show_hints} id="hints" />
        </span>
        <span>
          <label for="img_calls">Image Callouts: </label>
          <input type="checkbox" bind:checked={use_image_callouts} id="img_calls" />
        </span>
        <span>
          <label for="challenge_mode">Challenge Mode <Tooltip text={"For verity's challenge. Takes each statue's shape, makes it 3D, and rotates it one to the right. Check \"Show Hints\" to see the correct solution."}>
            <img src={helpurl} alt="question mark" width={16} height={16} style="filter: invert(1.0); opacity: 0.5;" /></Tooltip>: </label>
          <input type="checkbox" bind:checked={challenge_mode} id="challenge_mode" />
        </span>
        <span>
          <label for="real_drops">Realistic Symbol Drops: </label>
          <input type="checkbox" bind:checked={use_realistic_drops} id="real_drops" />
        </span>
      </div>
    </FoldRegion>
    <div class="callouts-symbols" class:compact={!use_image_callouts}>
      <Shape2D border={false} draggable={false} image={use_image_callouts} padding={use_image_callouts} shape={calls.left} />
      <Shape2D border={false} draggable={false} image={use_image_callouts} padding={use_image_callouts} shape={calls.mid} />
      <Shape2D border={false} draggable={false} image={use_image_callouts} padding={use_image_callouts} shape={calls.right} />
    </div>
    {#if challenge_mode && show_hints}
      <div class="callouts-symbols">
        <Shape compact={true} shape={challenge_things.left} />
        <Shape compact={true} shape={challenge_things.mid} />
        <Shape compact={true} shape={challenge_things.right} />
      </div>
    {/if}
  </div>
  <div class="state">
    <h2>Statue Objects</h2>
    <div class="state-symbols">
      <Shape
        shape={state.left}
        selected={state.selected?.slot === SelectedSlot.LEFT}
        on:shapedropped={onDropped(SelectedSlot.LEFT)}
        hints={show_hints}
      />
      <Shape
        shape={state.mid}
        selected={state.selected?.slot === SelectedSlot.MID}
        on:shapedropped={onDropped(SelectedSlot.MID)}
        hints={show_hints}
      />
      <Shape
        shape={state.right}
        selected={state.selected?.slot === SelectedSlot.RIGHT}
        on:shapedropped={onDropped(SelectedSlot.RIGHT)}
        hints={show_hints}
      />
    </div>
  </div>
</main>
<div class="toolbox">
  <div class="toolbox-symbols">
    <Shape2D
      shape={SHAPE2D.CIRCLE}
      on:shapedropped={onDropped(SelectedSlot.LEFT)}
      disabled={disabled.left}
    />
    <Shape2D
      shape={SHAPE2D.TRIANGLE}
      on:shapedropped={onDropped(SelectedSlot.MID)}
      disabled={disabled.mid}
    />
    <Shape2D
      shape={SHAPE2D.SQUARE}
      on:shapedropped={onDropped(SelectedSlot.RIGHT)}
      disabled={disabled.right}
    />
  </div>
</div>
<div id ="credit">
  <a href="https://github.com/EggAllocationService/verity-sim" style:height={"32px"}><img alt="github logo" src={ghLogo} width=32 height=32 style:filter={"invert(1)"} /></a>
  <span>@EggAllocationService with ❤️</span>
</div>

{#if is_complete}
  <div class="modal-backdrop">
    <div class="modal">
      <h1>Great work!</h1>
      <p>
        It took you {num_swaps} swaps to solve Verity in {(
          (Date.now() - start_time) /
          1000
        ).toFixed(2)} seconds!
      </p>
      <h2>
        Your Solution:
      </h2>
      <span class="row">
        <Shape2D padding={false} shape={calls.left} width={40} height={40} draggable={false} border={false}  />
        <Shape2D padding={false} shape={calls.mid} width={40} height={40} draggable={false} border={false}  />
        <Shape2D padding={false} shape={calls.right} width={40} height={40} draggable={false} border={false}  />
      </span>
      <span class="row">
        <Shape width={40} height={40} shape={state.left} compact={true} />
        <Shape width={40} height={40} shape={state.mid} compact={true} />
        <Shape width={40} height={40} shape={state.right} compact={true} />
      </span>
      <button on:click={reset}>Reset</button>
    </div>
  </div>
{/if}
<div id="popup">
  <DismissablePopup href="https://buymeacoffee.com/eggallocationservice" key="coffee">
    ☕️ Buy me a coffee!
  </DismissablePopup>
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 16px;
    margin: 8px;
  }
  #popup {
    z-index: 50;
    position: fixed;
    top: 2em;
    right: 1em;
    font-size: 12px;
  }
  .compact {
    justify-content: center !important;
    gap: 0px !important;
  }
  #credit {
    position: fixed;
    bottom: 1em;
    right: 1em;
    
    font-size: 1.5em;
    display: flex;
    flex-direction: column;
    font-size: 11px;
    align-items: flex-end;
    gap: 0.5em;
  }
  #credit > * {
    background:rgb(24, 24, 24);
    padding: 1em;
    color: white;
    text-align: left;
    border-radius: 100vh;
    display: inline-block;
    width:fit-content;
  }
  
  #hints {
    text-align: center;
    transform: translateY(-20%) scale(1.25);
  }
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--bg);
    padding: 1em;
    border: 1px solid black;
    border-radius: 0.5em;
  }

  .toolbox {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 1em;
    padding: 0.4em;
    margin-top: 2em;
  }
  .toolbox-symbols {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    gap: 3em;
  }

  .state {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 1em;
    padding: 1em;
    border: 1px solid white;
    width: 100%;
  }
  .state-symbols {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    gap: 2em;
  }

  .callouts {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    margin-top: 2rem;
    gap: 1em;
    padding: 1em;
    margin: 1em;
    border: 1px solid white;
  }
  .callouts > h2 {
    font-size: 2em;
  }
  .callouts-symbols {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    gap: 3em;
  }
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }
</style>
