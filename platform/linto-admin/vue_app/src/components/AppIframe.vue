<template>
  <div class="flex1 flex col">
     <iframe
      :src="iframeUrl"
      id="nodered-iframe"
      class="iframe flex1"
      sandbox="allow-same-origin allow-forms allow-scripts"
    ></iframe>
  </div>
</template>
<script>
export default {
  props: ['iframeUrl'],
  data () {
    return {}
  }
}
</script>