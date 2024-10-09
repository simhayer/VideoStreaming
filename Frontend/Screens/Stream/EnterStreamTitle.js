import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import commonStyles from '../../Resources/styles';
import {appPink, colors, errorRed} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const EnterStreamTitle = () => {
  const [title, setTitle] = useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const onNextClick = async () => {
    if (title.length === 0) {
      setIsError(true);
      setErrorMessage('Please provide a title');
      return;
    }

    navigation.navigate('StartStreamTab', {title});
  };

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 10,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={35} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2,
            textAlign: 'center',
            flex: 1,
          }}>
          Enter stream title
        </Text>
        <View style={{width: 35}} />
      </View>
      <View style={{width: '85%', marginTop: '5%'}}>
        <TextInput
          ref={inputRef}
          value={title}
          onChangeText={setTitle}
          placeholder={'Title'}
          style={{
            width: '100%',
            borderBottomWidth: 1,
            borderColor: 'black',
            fontSize: calculatedFontSize / 2.5,
            marginTop: 10,
            marginBottom: 5,
            paddingVertical: 10,
            paddingHorizontal: 5,
          }}
          autoComplete="off"
          autoCapitalize="none"
          placeholderTextColor={'gray'}
          autoCorrect={false}
          returnKeyType="next"
          maxLength={30}
          selectionColor={appPink}
          inputMode="text"
          onSubmitEditing={onNextClick}
          clearButtonMode="while-editing"
          keyboardAppearance="light"
        />
      </View>

      {isError && (
        <Text style={{fontSize: calculatedFontSize / 2.9, color: errorRed}}>
          {errorMessage}
        </Text>
      )}
      <TouchableOpacity
        onPress={onNextClick}
        style={{
          backgroundColor: appPink,
          borderRadius: 40,
          paddingVertical: '4%',
          alignItems: 'center',
          width: '80%',
          marginTop: '10%',
        }}>
        <Text
          style={{
            color: 'white',
            fontSize: calculatedFontSize / 2.2,
            fontWeight: 'bold',
          }}>
          Next
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EnterStreamTitle;
