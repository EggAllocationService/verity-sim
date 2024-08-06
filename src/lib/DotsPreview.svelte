<script lang="ts">
  export let dots: boolean[] = [];
  export let size: number = 8;
</script>

<span class="dots">
  {#each dots as dot}
    <span class="dot" class:active={dot} style={`width: ${size}px; height: ${size}px;`}></span>
  {/each}
</span>

<style>
  .dots {
    display: flex;
    flex-direction: row;
    gap: 0.5em;
  }

  .dot {
    background: grey;
    /*border-radius: 100%;*/
    display: inline-block;
    transition: background-color 0.2s;
  }

  .dot.active {
    background: rgb(63, 63, 230);
    box-shadow: 0 0 5px rgb(63, 63, 230);
  }
</style>