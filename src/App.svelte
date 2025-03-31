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

  function is_pure_shape(shape: SHAPE): boolean {
    return shape === SHAPE.CUBE || 
           shape === SHAPE.SPHERE || 
           shape === SHAPE.PYRAMID;
  }

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

  let { calls, state } = randomize();
  let num_swaps: number = 0;
  let optimal_swaps: number;
  let hint_message: string = "";
  if (is_pure_shape(state.left) && is_pure_shape(state.mid) && is_pure_shape(state.right)) {
    hint_message = "Three pure shapes; you can solve with three swaps";
    optimal_swaps = 3;
  } else {
    if (is_pure_shape(state.left) || is_pure_shape(state.mid) || is_pure_shape(state.right)) {
      hint_message = "One pure shape; you can solve with two swaps";
    } else {
      hint_message = "No pure shapes; you can solve with two swaps";
    }
    optimal_swaps = 2;
  }
  let is_complete: boolean = false;
  let start_time: number = Date.now();
  let show_hints = window.localStorage.getItem("show_hints") === "true";
  let use_image_callouts = (window.localStorage.getItem("use_image_callouts") === "true") || true;
  let use_realistic_drops = window.localStorage.getItem("use_realistic_drops") === "true";
  let challenge_mode = window.localStorage.getItem("challenge_mode") === "true";
  let knights = {
    left: true,
    mid: true,
    right: true
  };
  let ogre_mode = false;
  let ogres = {
    left: false,
    mid: false,
    right: false
  };
  let shape_timer: Record<SelectedSlot, number | undefined> = {
    left: undefined,
    mid: undefined,
    right: undefined
  };

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
      knights = {
        left: false,
        mid: false,
        right: false
      };
    }
  }
  $: {
    challenge_things.left = construct_shape_from_2d(calls.right, calls.right);
    challenge_things.mid = construct_shape_from_2d(calls.left, calls.left);
    challenge_things.right = construct_shape_from_2d(calls.mid, calls.mid);
  }

  function randomize() {
    var i = Math.floor(Math.random() * puzzles.length);
    return {
      calls: {
        left: puzzles[i].inside.left,
        mid: puzzles[i].inside.mid,
        right: puzzles[i].inside.right,
      },
      state: {
        left: puzzles[i].outside.left,
        mid: puzzles[i].outside.mid,
        right: puzzles[i].outside.right,
        selected: null,
      }
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

  function kill_knight(slot: SelectedSlot): (ev: MouseEvent) => void {
    return (ev) => {
      knights[slot] = false;
      shape_timer[slot] = setTimeout(() => {
        if (use_realistic_drops) {
          hint_message = `The ${slot} shape despawned since it wasn't used in time`;
          disabled[slot] = true;
        }
      }, 10000); // leave the shape on the "ground" for 10 seconds
    };
  }

  function kill_ogre(slot: SelectedSlot): (ev: MouseEvent) => void {
    return (ev) => {
      ogres[slot] = false;

      if (!ogres.left && !ogres.right) {
        // Both ogres were killed, so reset the knights and symbols and clear
        // any existing hint message.
        clear_timers();
        setTimeout(() => {
          ogre_mode = false;
          disabled = {left: false, mid: false, right: false};
          knights = {left: true, mid: true, right: true};
          hint_message = "";
          // reset after 3 seconds to allow for the kill animation to run
        }, 3000);
      }
    };
  }

  function onDragStart(slot: SelectedSlot): (ev: CustomEvent<SHAPE2D>) => void {
    return (event) => {
      if (shape_timer[slot]) {
        // clear the existing timer; starting a drag on a shape is like picking it up...
        clearTimeout(shape_timer[slot]);
        shape_timer[slot] = undefined;
      }
    };
  }

  function onDropped(slot: SelectedSlot): (ev: CustomEvent<SHAPE2D>) => void {
    return (event) => {
      let shape = event.detail;
      let newState = { ...state };
      let existing: SHAPE2D[] = decompose_shape(newState[slot]);
      console.log('existing', existing, 'shape', shape);
      if (!existing.includes(shape)) {
        // Symbol not placed in right slot
        console.log('exception 1');
        $: hint_message = "You can't use that shape here; the currently held 3D shape doesn't include it";
        return;
      }

      console.log('newState.selected', newState.selected, 'shape', slot);
      if (newState.selected?.slot == slot) {
        console.log('exception 2');
        $: hint_message = "You can't use that shape here; this statue is already active for swapping a shape";
        return; // selecting same slot dont work
      }

      if (use_realistic_drops) {
        let startSlot;
        if (event.detail == SHAPE2D.CIRCLE) {
          startSlot = SelectedSlot.LEFT;
        } else if (event.detail == SHAPE2D.TRIANGLE) {
          startSlot = SelectedSlot.MID;
        } else {
          startSlot = SelectedSlot.RIGHT;
        }
        if (shape_timer[startSlot]) {
          clearTimeout(shape_timer[startSlot]);
          shape_timer[startSlot] = undefined;
        }
        disabled[startSlot] = true;
        $: hint_message = "";

        // if all symbols have been disabled (removed from the field),
        // bring out the ogres!
        if (disabled.left && disabled.mid && disabled.right) {
          $: hint_message = "Watch out for unstoppable ogres!";
          ogre_mode = true;
          ogres = { left: true, mid: false, right: true };
        }
      }
  
      if (newState.selected == null) {
        // select this slot
        newState.selected = { slot, shape };
      } else {
        // decompose
        let sA: SHAPE2D[] = decompose_shape(newState[newState.selected.slot]); // selected
        let sB: SHAPE2D[] = decompose_shape(newState[slot]); // dropped

        // remove selected shape from selected slot
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
        if (is_complete) {
          ogre_mode = false;
          clear_timers();
        }
      }, 10);
    };
  }
  let disabled: {left: boolean, mid: boolean, right: boolean} = {left: false, mid: false, right: false};

  function clear_timers() {
    // reset any shape_timers
    Object.keys(shape_timer).forEach((key) => {
      const k = key as SelectedSlot;
      if (shape_timer[k]) {
        clearTimeout(shape_timer[k]);
        shape_timer[k] = undefined;
      }
    });
  }

  function reset() {
    let { calls: newCalls, state: newState } = randomize();
    calls = newCalls;
    state = newState;
    hint_message = "";
    num_swaps = 0;
    is_complete = false;
    start_time = Date.now();
    clear_timers();
    disabled = {left: false, mid: false, right: false};
    ogres = {left: false, mid: false, right: false};
    knights = {left: true, mid: true, right: true};
    ogre_mode = false;
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
          <label for="img_calls">Image Callouts:</label>
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
        callout={calls.left}
        selected={state.selected?.slot === SelectedSlot.LEFT}
        on:shapedropped={onDropped(SelectedSlot.LEFT)}
        hints={show_hints}
      />
      <Shape
        shape={state.mid}
        callout={calls.mid}
        selected={state.selected?.slot === SelectedSlot.MID}
        on:shapedropped={onDropped(SelectedSlot.MID)}
        hints={show_hints}
      />
      <Shape
        shape={state.right}
        callout={calls.right}
        selected={state.selected?.slot === SelectedSlot.RIGHT}
        on:shapedropped={onDropped(SelectedSlot.RIGHT)}
        hints={show_hints}
      />
    </div>
    {#if show_hints && hint_message}
      <div id="hint">
        <strong>Hint:</strong> {hint_message}
      </div>
    {/if}
  </div>
</main>
<div class="toolbox">
  <div class="toolbox-symbols">
    {#if ogre_mode}
      <img on:click={kill_ogre(SelectedSlot.LEFT)} class={"enemy " + (!ogres.left ? "dead": "") } src="/hive-ogre-champion.png" height="98" width="98" alt="Hive Ogre" />
      <img on:click={kill_ogre(SelectedSlot.RIGHT)} class={"flip-horizontal enemy " + (!ogres.right ? "dead": "")} src="/hive-ogre-champion.png" height="98" width="98" alt="Hive Ogre" />
    {:else}
      {#if use_realistic_drops && knights[SelectedSlot.LEFT]}
        <img class="flip-horizontal enemy" on:click={kill_knight(SelectedSlot.LEFT)} src="/hive-knight.png" height="98" width="98" alt="Hive Knight" />
      {:else}
        <Shape2D
          shape={SHAPE2D.CIRCLE}
          on:shapedragstart={onDragStart(SelectedSlot.LEFT)}
          on:shapedropped={onDropped(SelectedSlot.LEFT)}
          disabled={disabled.left}
        />
      {/if}
      {#if use_realistic_drops && knights[SelectedSlot.MID]}
        <img class="enemy" on:click={kill_knight(SelectedSlot.MID)} src="/hive-knight.png" height="98" width="98" alt="Hive Knight">
      {:else}
        <Shape2D
          shape={SHAPE2D.TRIANGLE}
          on:shapedragstart={onDragStart(SelectedSlot.MID)}
          on:shapedropped={onDropped(SelectedSlot.MID)}
          disabled={disabled.mid}
        />
      {/if}
      {#if use_realistic_drops && knights[SelectedSlot.RIGHT]}
        <img class="enemy" on:click={kill_knight(SelectedSlot.RIGHT)} src="/hive-knight.png" height="98" width="98" alt="Hive Knight">
      {:else}
        <Shape2D
          shape={SHAPE2D.SQUARE}
          on:shapedragstart={onDragStart(SelectedSlot.RIGHT)}
          on:shapedropped={onDropped(SelectedSlot.RIGHT)}
          disabled={disabled.right}
        />
      {/if}
    {/if}
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
        {#if !challenge_mode && num_swaps > optimal_swaps}
          <br>
          But... you only needed to do {optimal_swaps} swaps for this one!
        {/if}
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
  #hint {
    font-style: italic;
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

  .dead {
    opacity: 0.5 !important;
    transform: scaleX(1) rotate(90deg) !important;
  }

  .enemy {
    cursor: crosshair;
    opacity: 1;
    transform: scaleX(1) rotate(0deg);
    transform-origin: 47% 85%;
    transition: transform 0.5s ease-in-out, opacity 1s ease-in-out 1s;
  }

  .flip-horizontal {
    transform: scaleX(-1) rotate(0deg);
  }

  .flip-horizontal.dead {
    transform: scaleX(-1) rotate(90deg) !important;
  }
</style>
