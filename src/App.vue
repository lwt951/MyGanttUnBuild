<template>
  <GanttSchedule></GanttSchedule>
</template>

<script>
import GanttSchedule from './components/GanttSchedule';

export default {
  name: 'App',
  components: {
    GanttSchedule
  }
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
