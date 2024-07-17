<script lang="ts">
    export let text: string = "";
</script>

<span class="tooltip">
    <slot></slot>
    <span class="tooltiptext">
        {text}
    </span>
</span>

<style>
    /* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 400px;
  background-color: white;
  color: #222;
  text-align: center;
  padding: 10px;
  border-radius: 6px;
 
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>