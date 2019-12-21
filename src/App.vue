<template>
  <div id="app">
    <div>
      <label>title:</label>
      <span v-if="translateData">{{ translateData['title'] }}</span>
    </div>
    <div>
      <label>button:</label>
      <span v-if="translateData">{{ translateData['button'] }}</span>
    </div>

    <div>
      <button @click="switchLang">切换语言</button>
    </div>
  </div>
</template>

<script>
import translateManager from './translateManager.js';

export default {
  name: 'App',
  data() {
    return {
      language: '',
      translateData: null,
    }
  },
  created() {
    this.language = window.language;
    translateManager.update(this.language, (res) => {
      this.translateData = res.data['namespace1'];
    })
  },
  methods: {
    switchLang() {
      window.language = window.language === 'cn' ? 'en' : 'cn';
      this.language = window.language;
      translateManager.update(this.language, (res) => {
        this.translateData = res.data['namespace1'];
      })
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
