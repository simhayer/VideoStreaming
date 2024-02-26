import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
//import { WebSocket } from 'react-native-websocket';

const HomeTab2 = () => {
  const [messages, setMessages] = useState([]);
  const [guid, setGuid] = useState('');
  const ws = useRef(new WebSocket('ws://10.0.2.2:3000/cable'));
  const messagesContainer = useRef(null);

  useEffect(() => {
    ws.current.onopen = () => {
      console.log('Connected to websocket server');
      setGuid(Math.random().toString(36).substring(2, 15));

      ws.current.send(
        JSON.stringify({
          command: 'subscribe',
          identifier: JSON.stringify({
            id: guid,
            channel: 'MessagesChannel',
          }),
        })
      );
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'ping') return;
      if (data.type === 'welcome') return;
      if (data.type === 'confirm_subscription') return;

      const message = data.message;
      setMessagesAndScrollDown([...messages, message]);
    };

    return () => {
      ws.current.close();
    };
  }, [guid, messages]);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    resetScroll();
  }, [messages]);

  const handleSubmit = async () => {
    // Assuming you have a function to handle message submission
    const body = ''; // Add logic to get the message body
    await fetch('http://localhost:3000/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body }),
    });
  };

  const fetchMessages = async () => {
    const response = await fetch('http://localhost:3000/messages');
    const data = await response.json();
    setMessagesAndScrollDown(data);
  };

  const setMessagesAndScrollDown = (data) => {
    setMessages(data);
    resetScroll();
  };

  const resetScroll = () => {
    if (!messagesContainer.current) return;
    messagesContainer.current.scrollToEnd();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 24 }}>Messages</Text>
        <Text>Guid: {guid}</Text>
      </View>
      <ScrollView
        ref={messagesContainer}
        style={{ flex: 1, borderWidth: 1, marginTop: 8 }}
      >
        {messages.map((message) => (
          <View key={message.id} style={{ padding: 8 }}>
            <Text>{message.body}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={{ marginTop: 8 }}>
        <TextInput
          style={{ borderWidth: 1, padding: 8 }}
          placeholder="Type your message"
          // onChangeText={(text) => setNewMessage(text)} // Assuming you have state for the new message
        />
        <Button onPress={handleSubmit} title="Send" />
      </View>
    </View>
  );
};

export default HomeTab2;
