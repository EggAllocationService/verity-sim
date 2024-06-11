<script lang="ts">
    import Shape from './lib/Shape.svelte';
    import Shape2D from './lib/Shape2D.svelte';
    import { SHAPE2D, SHAPE, construct_shape_from_2d, decompose_shape } from './lib/shapes';
    import { remove_one_item_from_array } from './lib/util';

    enum SelectedSlot {
        LEFT = "left",
        MID = "mid",
        RIGHT = "right"
    }
    type Callouts = {left: SHAPE2D, mid: SHAPE2D, right: SHAPE2D};
    type PuzzleState = {left: SHAPE, mid: SHAPE, right: SHAPE, selected: {slot: SelectedSlot, shape: SHAPE2D} | null};

    let calls: Callouts = createRandomCallouts();
    let state: PuzzleState = createRandomState(calls);
    let num_swaps: number = 0;
    let is_complete: boolean = false;
    let start_time: number = Date.now();
    let show_hints = false;

    function createRandomCallouts(): Callouts {
        let arr = [SHAPE2D.CIRCLE, SHAPE2D.SQUARE, SHAPE2D.TRIANGLE];
        // Shuffle the array
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        return {
            left: arr[0],
            mid: arr[1],
            right: arr[2]
        };
    }
    function createRandomState(calls: Callouts): PuzzleState {
        let arr = [SHAPE2D.CIRCLE, SHAPE2D.SQUARE, SHAPE2D.TRIANGLE, SHAPE2D.CIRCLE, SHAPE2D.SQUARE, SHAPE2D.TRIANGLE];
        let i = 0;
        while (true) {
         // Shuffle the array
          for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
          }

          let tmp: PuzzleState = {
              left: construct_shape_from_2d(arr[0], arr[1]),
              mid: construct_shape_from_2d(arr[2], arr[3]),
              right: construct_shape_from_2d(arr[4], arr[5]),
              selected: null
          };

          if (!isComplete(tmp, calls) || i++ == 20) {
              return tmp;
          }
        }
    
    }

    function isComplete(state: PuzzleState, calls: Callouts): boolean {
      // check that for each slot, the 2d shape plus the decomposed 3d shape is all three 2d shapes
      let left = decompose_shape(state.left);
      let mid = decompose_shape(state.mid);
      let right = decompose_shape(state.right);
      return !left.includes(calls.left) && !mid.includes(calls.mid) && !right.includes(calls.right);
    }


    function onDropped(slot: SelectedSlot): (ev: CustomEvent<SHAPE2D>) => void {
      return (event) => {
        let shape = event.detail;
        let newState = {...state};
        let existing: SHAPE2D[] = decompose_shape(newState[slot]);
        if (!existing.includes(shape)) {
          // Symbol not placed in right slot
          return;
        }
        if (newState.selected?.slot == slot) return; // selecting same slot dont work
        if (newState.selected == null) {
          // select this slot
          newState.selected = {slot, shape};
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
          newState[newState.selected.slot] = construct_shape_from_2d(sA[0], sA[1]);
          newState[slot] = construct_shape_from_2d(sB[0], sB[1]);
          newState.selected = null;
          console.log("New state", newState)
          num_swaps++;
        }
        setTimeout(() => {
          state = newState;
          console.log("State updated")
          is_complete = isComplete(state, calls);
          console.log("Is complete", is_complete)
        }, 10);
      };
    }

    function reset() {
      calls = createRandomCallouts();
      state = createRandomState(calls);
      num_swaps = 0;
      is_complete = false;
      start_time = Date.now();
    }
</script>

<main>
  <div class="callouts">
    <h2>
      Inside Callouts
    </h2>
    <span>
      <label for="hints">Show hints: </label>
      <input type="checkbox" bind:checked={show_hints} id="hints" />
    </span>
    <div class="callouts-symbols">
      <Shape2D border={false} draggable={false} shape={calls.left} />
      <Shape2D border={false} draggable={false} shape={calls.mid} />
      <Shape2D border={false} draggable={false} shape={calls.right} />
    </div>
  </div>
  <div class="state">
    <h2>
      Statue Objects
    </h2>
    <div class="state-symbols">
      <Shape shape={state.left} selected={state.selected?.slot === SelectedSlot.LEFT} on:shapedropped={onDropped(SelectedSlot.LEFT)} hints={show_hints}/>
      <Shape shape={state.mid} selected={state.selected?.slot === SelectedSlot.MID} on:shapedropped={onDropped(SelectedSlot.MID)} hints={show_hints} />
      <Shape shape={state.right} selected={state.selected?.slot === SelectedSlot.RIGHT} on:shapedropped={onDropped(SelectedSlot.RIGHT)} hints={show_hints} />
    </div>
  </div>
</main>
<div class="toolbox">
  <div class="toolbox-symbols">
    <Shape2D shape={SHAPE2D.CIRCLE} on:shapedropped={onDropped(SelectedSlot.LEFT)} />
    <Shape2D shape={SHAPE2D.SQUARE} on:shapedropped={onDropped(SelectedSlot.MID)} />
    <Shape2D shape={SHAPE2D.TRIANGLE} on:shapedropped={onDropped(SelectedSlot.RIGHT)} />
  </div>
</div>

{#if is_complete}

  <div class="modal-backdrop">
    <div class="modal">
      <h1>Great work!</h1>
      <p>It took you {num_swaps} swaps to solve Verity in {((Date.now() - start_time) / 1000).toFixed(2)} seconds!</p>
      <button on:click={reset}>Reset</button>
    </div>
  </div>
{/if}

<style>
  #hints {
    text-align: center;
    transform:translateY(-20%) scale(1.25);
  }
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
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
    background-color: #333;
    padding: 1em;
    border: 1px solid black;
    border-radius: 0.5em;
  }

  .toolbox {
    position:sticky;
    bottom: 0;
    left: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 1em;
    padding: 0.4em;

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
    height: 100vh;
  }
</style>
