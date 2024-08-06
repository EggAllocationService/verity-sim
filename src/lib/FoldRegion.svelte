<script lang="ts">
    import { onMount } from "svelte";
    import DotsPreview from "./DotsPreview.svelte";
    import { blur } from "svelte/transition";

  export let expanded: boolean = false;
  export let title: string = "Thing";
  export let speed: number = 300;
  export let dots: boolean[] | null = null;

  function toggle() {
    expanded = !expanded;
    if (expanded) {
      icon.animate(
        [{ transform: "rotateZ(90deg)" }, { transform: "rotateZ(0deg)" }],
        { duration: speed, fill: "forwards" },
      );
    } else {
      icon.animate(
        [{ transform: "rotateZ(0deg)" }, { transform: "rotateZ(90deg)" }],
        { duration: speed, fill: "forwards" },
      );
    }

    // calculate height of the content
    let height = content.clientHeight;
    // animate region
    if (expanded) {
      region.animate(
        [
          { height: `${btn.clientHeight}px` },
          { height: `${btn.clientHeight + height + 12}px` },
        ],
        { duration: speed, fill: "forwards" },
      ).onfinish = () => {
        region.style.overflow = "visible";
      };
    } else {
      region.style.overflow = "hidden";
      region.animate(
        [
          { height: `${btn.clientHeight + height + 12}px` },
          { height: `${btn.clientHeight}px` },
        ],
        { duration: speed, fill: "forwards" },
      );
    }
  }
  let btn: HTMLElement;
  let icon: HTMLElement;
  let content: HTMLElement;
  let region: HTMLElement;
</script>

<div class="fold-region" class:expanded bind:this={region}>
  <button class="header" on:click={toggle} bind:this={btn}>
    <span>{title}</span>
    <span class="group">
      {#if dots != null && !expanded}
        <DotsPreview {dots} size={4}  />
      {/if}
      <span class="icon" bind:this={icon}>▼</span>
    </span>
  </button>
  <div class="fold-region-content" bind:this={content}>
    <slot></slot>
  </div>
</div>

<style>
  .group {
    display: inline-flex;
    padding: 0px;
    margin: 0px;
    gap: 1em;
    align-items: center;
  }
  button {
    width: 100%;
    padding: 0.8em;
    background: transparent !important;
    color: white;
    border: none;
    text-align: left;
    display: flex;
    justify-content: space-between;
  }
  .icon {
    transform: rotateZ(90deg);
  }

  .fold-region {
    overflow: hidden;
    border-radius: 12px;
    height: 44px;
    background-color: rgba(16, 16, 16, 0.196);
    color: white;
  }
</style>
