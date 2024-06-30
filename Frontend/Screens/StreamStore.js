const streams = {};

const StreamStore = {
  setStream: (id, stream) => {
    streams[id] = stream;
  },
  getStream: id => {
    return streams[id];
  },
  removeStream: id => {
    delete streams[id];
  },
};

export default StreamStore;
