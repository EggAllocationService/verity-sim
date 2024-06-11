<script lang="ts">
    import Shape from './lib/Shape.svelte';
    import Shape2D from './lib/Shape2D.svelte';
</script>

<main>
  <p>
    <Shape selected={true} />  
  </p>
  <p>
    <Shape2D />
  </p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
