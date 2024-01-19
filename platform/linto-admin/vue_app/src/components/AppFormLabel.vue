<template>
  <div class="flex row" style="position: relative;">
    <button class="helper-btn" v-if="helperBtn === true" @click="toggleInfos()">?</button>
    <span class="helper-content" v-if="helperBtn === true && showHelper"><button class="close" @click="closeHelper()"></button><p v-html="helperBtnContent"></p></span>
    <span class="form__label" v-if="!noLabel">{{ label }} <strong v-if="required">*</strong> :</span>
  </div>

</template>
<script>
export default {
  props: ['noLabel', 'label', 'helperBtn', 'helperBtnContent','required'],
  data() {
    return {
      showHelper:false
    }
  },
  methods: {
    closeHelper () {
      this.showHelper = false
    },
    toggleInfos () {
      this.showHelper = !this.showHelper
    }
  }
}
</script>