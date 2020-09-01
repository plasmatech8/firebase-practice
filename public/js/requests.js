
var app = new Vue({
  el: '#app',
  data: {
    requests: [],
  },
  methods: {
    upvoteRequest(id) {
      const upvote = firebase.functions().httpsCallable('upvote');
      console.log(id)
      upvote({ id }).then(result => {
        console.log(result);
      }).catch(error => {
        console.log(error.message);
        showNotification(error.message);
      });
    }
  },
  mounted() {
    const ref = firebase.firestore().collection('requests').orderBy('upvotes', 'desc');
    ref.onSnapshot(snapshot => {
      var requests = [];
      snapshot.forEach(doc => {
        requests.push({ ...doc.data(), id: doc.id });
      });
      this.requests = requests;
    });
  }
});

