<script>
import UpdatesPage from '@/components/Update/UpdatesPage.vue';
export default {
  name: 'TagView',
  mixins: [UpdatesPage],
  computed: {
    updates() {
      const updates = this.$store.state.updates[this.$route.params.id] || [];
      let groupedUpdates = {
        ['#' + this.$store.state.tagFilter]: [],
      }
      return updates.reduce((groups, u) => {
        u.tags.forEach(tag => {
          const header = '#' + tag;
          if (header in groups) {
            groups[header].push(u);
          }
        });
        return groups;
      }, groupedUpdates);
    }
  },
}
</script>