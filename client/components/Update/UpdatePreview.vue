<template>
  <article
    class="update preview"
    :class="{flagged: inReadingList}"
    @click="openUpdate(update)"
  >
    <div>
      {{ update.dateModified }}: 
      {{ update.summary }}
    </div>
    <p class="update-status status" :class="statusToText[update.status]">
      {{ statusToText[update.status] }}
    </p>
    <p
      v-for="tag in this.update.tags"
      class="update-status status"
    >
      #{{ tag }}
    </p>
    <ThanksCount :update="update"/>
  </article>
</template>

<script>
import ThanksCount from '@/components/Thanks/ThanksCount.vue';

export default {
  name: 'UpdatePreview',
  components: {ThanksCount},
  props: {
    update: {
      type: Object,
      required: true,
    },
    openUpdate: {
      type: Function,
      required: true,
    }
  },
  data()  {
    return {
      statusToText: {
        'inprogress': 'In-Progress',
        'blocked': 'Blocked',
        'completed': 'Completed',
      },
    }
  },
  computed: {
    inReadingList() {
      return this.update._id in this.$store.state.eyeswanted;
    }
  },
  beforeMount() {
    this.$store.commit('refreshAllThanks', this.update._id); 
  },
  methods: {
    isThankedby() {
      const allthanks = this.$store.state.allthanks;
      this.thanks = allthanks.filter(thanks => thanks.updateId._id === this.update._id);
      return this.thanks;
    },
  }
}
</script>

<style scoped>
.update {
  margin-bottom: 16px;
}

.update.flagged {
  border-color: #993636;
}

.update > p {
  margin: 0;
}

.update > div + p {
  margin-top: 8px;
}
.update-status.Blocked {
  background-color: #F58870;
}

.thanks-number {
  font-size: 80%;
  color:rgb(125, 125, 125);
}
.status:not(:first-child) {
  margin-right: 4px !important;
}
</style>