<script lang="ts">
    import Shape from './lib/Shape.svelte';
    import Shape2D from './lib/Shape2D.svelte';
    import { SHAPE2D } from './lib/shapes';

    type Callouts = {left: SHAPE2D, mid: SHAPE2D, right: SHAPE2D};

    let calls: Callouts = createRandomCallouts();

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

</script>

<main>
  <div class="callouts">
    <h2>
      Callouts
    </h2>
    <div class="callouts-symbols">
      <Shape2D border={false} draggable={false} shape={calls.left} />
      <Shape2D border={false} draggable={false} shape={calls.mid} />
      <Shape2D border={false} draggable={false} shape={calls.right} />
    </div>
  </div>
</main>

<style>
  .callouts {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    margin-top: 2rem;
    gap: 1em;
    padding: 3em;
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
