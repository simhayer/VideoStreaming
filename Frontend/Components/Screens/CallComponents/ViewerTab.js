import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { RTCIceCandidate, RTCSessionDescription, RTCPeerConnection, mediaDevices } from 'react-native-webrtc';
import axios from 'axios';
import io from 'socket.io-client';

const configurationPeerConnection = {
  iceServers: [{
    urls: "stun:stun.stunprotocol.org"
  }]
};

const offerSdpConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  },
  optional: [],
};

const addTransceiverConstraints = { direction: "recvonly" };

const Viewer = () => {
  const [peer, setPeer] = useState(null);
  const [broadcastId, setBroadcastId] = useState('');
  const [localCandidates, setLocalCandidates] = useState([]);
  const [remoteCandidates, setRemoteCandidates] = useState([]);
  const [list, setList] = useState([]);
  const [socketId, setSocketId] = useState('');
  const [socket] = useState(io('http://10.0.2.2:3000'));

  useEffect(() => {
    showList();

    socket.on('from-server', function (_socket_id) {
      setSocketId(_socket_id);
      console.log("me connected: " + _socket_id);
    });

    socket.on("candidate-from-server", (data) => {
      setRemoteCandidates((prev) => [...prev, data]);
    });

  }, []);

  const showList = async () => {
    // console.log("in here")
    // //const { data } = await axios.get("/list-broadcast");
    // const { data } = await axios.get('http://10.0.2.2:3000/list-broadcast');
    // setList(data.data);

    try {
        const response = await axios.get("http://10.0.2.2:3000/list-broadcast");
        setList(response.data);
      } catch (error) {
        console.error("Error fetching broadcasts: ", error);
      }
  };

  const watch = async (e) => {
    const broadcast_id = e;
    setBroadcastId(broadcast_id);
    await createPeer();
  };

  const createPeer = async () => {
    setLocalCandidates([]);
    setRemoteCandidates([]);

    if (peer) {
      return handleNegotiationNeededEvent(peer);
    }

    const newPeer = new RTCPeerConnection(configurationPeerConnection, offerSdpConstraints);

    newPeer.addTransceiver("video", addTransceiverConstraints);
    newPeer.addTransceiver("audio", addTransceiverConstraints);

    //newPeer.ontrack = handleTrackEvent;

    newPeer.ontrack = (event) => {
        setStream(event.streams[0]);
      };
  

    iceCandidate(newPeer);

    newPeer.onnegotiationneeded = async () => await handleNegotiationNeededEvent(newPeer);

    setPeer(newPeer);
    return newPeer;
  };

  const handleNegotiationNeededEvent = async (peer) => {
    const offer = await peer.createOffer({ offerToReceiveVideo: 1 });
    await peer.setLocalDescription(offer);
    const payload = {
      sdp: peer.localDescription,
      broadcast_id: broadcastId,
      socket_id: socketId
    };
    //const { data } = await axios.post('/consumer', payload);
    const { data } = await axios.post('http://10.0.2.2:3000/consumer', payload);
    //console.log(data.data);

    const desc = new RTCSessionDescription(data.data.sdp);
    await peer.setRemoteDescription(desc).catch(e => console.log(e));

    localCandidates.forEach((candidate) => {
      socket.emit("add-candidate-consumer", {
        id: data.data.id,
        candidate
      });
    });

    remoteCandidates.forEach((candidate) => {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    });
  };

//   const handleTrackEvent = (e) => {
//     const videoElement = document.getElementById("video");
//     if (videoElement) {
//       videoElement.srcObject = e.streams[0];
//     }

//     const handleRemoteCandidate = (candidate) => {
//     if (peer) {
//       peer.addIceCandidate(new RTCIceCandidate(candidate));
//     }
//   };
//   };

  const handleRemoteCandidate = (candidate) => {
    if (peer) {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };


  const iceCandidate = (peer) => {
    peer.onicecandidate = (e) => {
      if (!e || !e.candidate) return;
      const candidate = {
        candidate: String(e.candidate.candidate),
        sdpMid: String(e.candidate.sdpMid),
        sdpMLineIndex: e.candidate.sdpMLineIndex,
      };
      setLocalCandidates((prev) => [...prev, candidate]);
    };

    peer.onconnectionstatechange = (e) => {
      console.log("status", e);
    };

    peer.onicecandidateerror = (e) => {
      console.log("error", e);
    };

    peer.oniceconnectionstatechange = (e) => {
      const connectionStatus = peer.connectionState;
      if (["disconnected", "failed", "closed"].includes(connectionStatus)) {
        console.log("disconnected");
      } else {
        console.log("connected");
      }
    };
  };

  return (
    <View>
      <Text>Viewer of Streaming</Text>
      <Button title="View Streams" onPress={showList} />
      <FlatList
        data={list}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => (
          <Button title={`Watch ${item}`} onPress={() => watch(item)} />
        )}
      />
      <View id="text-container">
        {broadcastId && <Text>Streaming on id: {broadcastId}</Text>}
      </View>
    </View>
  );
};

export default Viewer;
