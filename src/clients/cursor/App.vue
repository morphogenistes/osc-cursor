<template>
  <svg ref="bg" id="bg"></svg>

  <svg id="cursorOverlay">
    <ellipse v-if="showPointer"
      :cx="pointer.x"
      :cy="pointer.y"
      rx="20"
      ry="20"
      fill="#f00">
    </ellipse>
  </svg>
</template>

<style>
#cursorOverlay, #bg {
  width: 100%;
  /* height: 100%; */
  min-height: 100vh;
  /* max-height: 100vh; */
  position: absolute;
  overflow: hidden;
  top: 0; right: 0; bottom: 0; left: 0;
}
#cursorOverlay {
  background-color: transparent;
  z-index: 1000;
  pointer-events: none;
}
#bg {
  background-color: black;
  pointer-events: all !important;
}
</style>

<script>
import { inject } from 'vue';

export default {
  inject: [ '$store', '$localStore' ],
  data() {
    return {
      pointerId: undefined,
      pointer: [0, 0],
      showPointer: false,
    };
  },
  created() {},
  async mounted() {
    document.addEventListener('touchmove', e => { e.preventDefault(); }, { passive: false });
    document.addEventListener('pointerdown', this.onTouchStart, false);
    document.addEventListener('pointermove', this.onTouchMove, false);
    document.addEventListener('pointerup', this.onTouchRelease, false);
  },
  beforeUnmount() {
    document.removeEventListener('pointerdown', this.onTouchStart, false);
    document.removeEventListener('pointermove', this.onTouchMove, false);
    document.removeEventListener('pointerup', this.onTouchRelease, false);
  },
  methods: {
    onTouchStart(e) {
      if (this.pointerId !== undefined) return;
      this.pointerId = e.pointerId;
      const { center, cursor, localPos } = this.processPointerEvent(e);
      // console.log("mousedown");
      console.log(localPos);
      this.pointer = cursor;
      this.$store.set('mousePressed', true);
      this.$store.set('mousePosition', [ localPos.x, localPos.y ]);
      this.showPointer = true;
    },
    onTouchMove(e) {
      if (this.pointerId !== e.pointerId) return;
      // e.preventDefault();
      if (this.showPointer) {
        const { center, cursor, localPos } = this.processPointerEvent(e);
        // console.log("mousedrag");
        console.log(localPos);
        this.pointer = cursor;
        this.$store.set('mousePosition', [ localPos.x, localPos.y ]);
      }
    },
    onTouchRelease(e) {
      if (e.pointerId !== this.pointerId) return;
      this.pointerId = undefined;
      if (this.showPointer) {
        // console.log("mouseup");
        this.showPointer = false;
        this.$store.set('mousePressed', false);
      }
    },
    ////////////////////////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////////////////////////
    processPointerEvent(e) {
      // @fixme - this doesn't work if we resize the window without refreshing :
      // the globe is not centered on the page anymore
      const { clientWidth: w, clientHeight: h } = document.body;
      const center = { x: w * 0.5, y: h * 0.5 };
      const cursor = { x: e.clientX, y: e.clientY };
      const localPos = { x: 2 * (cursor.x - center.x) / h, y: -2 * (cursor.y - center.y) / h };
      
      return { center, cursor, localPos };
    },
  },
};
</script>

<script setup>
import { inject } from 'vue';

const $store = inject('$store');
const $localStore = inject('$localStore');

</script>