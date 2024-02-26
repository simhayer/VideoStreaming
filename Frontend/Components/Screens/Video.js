import { useRef, useState } from "react";
import { MediaStream, RTCPeerConnection } from "react-native-webrtc";


const Video = () => {
  
  const [localStream, setLocalStream] = useState(new MediaStream);
  const [remoteStream, setRemoteStream] = useState(new MediaStream);
  const [gettingCall, setGettingCall] = useState(new MediaStream);
  const pc = useRef<RTCPeerConnection>();

  return (
    <View></View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Video;
