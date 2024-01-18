<template>
  <div class="flex col">
    <span class="form__label">{{ label }} <strong v-if="required">*</strong>:</span>
    <textarea
      class="form__textarea"
      v-model="obj.value"
      :class="[obj.error !== null ? 'form__textarea--error' : '', obj.value.length > 0 && obj.valid ? 'form__textarea--valid': '']"
      @change="testContent(obj)"
    ></textarea>
    <span class="form__error-field">{{ obj.error }}</span>
  </div>
</template>
<script>
 export default {
   props: ['obj', 'label', 'required'],
   data () {
     return {}
   },
   methods: {
     testContent(obj) {
       this.$options.filters.testContent(obj)
     }
   }
 }
</script>