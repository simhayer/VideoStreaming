// StreamStore.js
const StreamStore = {
    streams: {},
    setStream(id, stream) {
      this.streams[id] = stream;
    },
    getStream(id) {
      return this.streams[id];
    }
  };
  
  export default StreamStore;
  