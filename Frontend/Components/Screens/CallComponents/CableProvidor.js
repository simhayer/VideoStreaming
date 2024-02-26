import React, { createContext, useContext } from "react";
import ActionCable from "react-native-actioncable";

const CableContext = createContext();

function CableProvider({ children }) {
  const actionCableUrl = "ws://10.0.2.2:3000/cable";

  const CableApp = {};
  CableApp.cable = ActionCable.createConsumer(actionCableUrl);

  return (
    <CableContext.Provider value={CableApp}>{children}</CableContext.Provider>
  );
}

// Custom hook to access the CableContext
function useCable() {
  return useContext(CableContext);
}

export { CableProvider, useCable };