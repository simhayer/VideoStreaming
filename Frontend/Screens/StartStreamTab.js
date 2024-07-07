import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Button, SafeAreaView, Text, TextInput} from 'react-native';

const StartStreamTab = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');

  const startStream = async () => {
    navigation.navigate('StreamScreen', {title});
  };

  return (
    <SafeAreaView>
      <Button title="Start Stream" onPress={startStream} />
      <TextInput
        value={title}
        onChangeText={title => setTitle(title)}
        placeholder={'Title'}
        style={{
          //fontSize: calculatedFontSize / 2.3,
          paddingBottom: '0%',
          marginBottom: '5%',
        }}
      />
    </SafeAreaView>
  );
};

export default StartStreamTab;
