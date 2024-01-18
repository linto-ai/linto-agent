<template>
  <header id="header" class="flex row" :class="extraClass">
    <div class="header__logo flex1">
      <img src="/assets/img/admin-logo-dark@2x.png" alt="linto admin">
    </div>
    <div class="header__nav flex3">
      <a 
        href="/logout" 
        class="button button-icon button--red">
        <span class="button__icon button__icon--logout"></span>
      </a>
    </div>
  </header>
</template>
<script>
export default {
  props:['extraClass'],
  data () {
    return {}
  }
}
</script>
