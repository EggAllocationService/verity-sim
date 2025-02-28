<script lang="ts">
    import { blur, fade } from "svelte/transition";
  export let href: string = "#"
  export let key: string;
  import closeUrl from "../assets/close.svg"
  
  let should_display = true;
  if (window.localStorage.getItem(key) === "dismissed") {
    should_display = false;
  }

  function dismiss() {
    window.localStorage.setItem(key, "dismissed");
    should_display = false;
  }
</script>

{#if should_display} 
<div class="container" out:blur={{amount: 10, duration: 200}}>
  <a href={href} class="dismissable-popup" target="_blank">
    <slot></slot>
  </a>
  <button on:click={dismiss}>
    <img src={closeUrl} alt="Close" width=16 height=16 />
  </button>
</div>
{/if}

<style>
  .container {
    background: rgb(24,24,24);
    border-radius: 100vh;
    padding-left: 1em;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    max-height: 3em;
  }
  a {
    color: white;
    margin-top: .5em;
    margin-bottom: .5em;
  }
  img {
    filter: invert(1);
    display: inline;
    transform: translateY(1.5px);
  }
  button {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: .5em;
    border-radius: 0px;
    padding-right: 1em;
    padding-left: .5em;
    padding-top: 100%;
    padding-bottom: 100%;
    height: 100%;
  }
  button:hover {
    background: rgba(255, 255, 255, 0.1);
  }
</style>