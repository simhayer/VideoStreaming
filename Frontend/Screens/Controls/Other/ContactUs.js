import {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {appPink, colors} from '../../../Resources/Constants';

export default function ContactUs() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const [requestSent, setRequestSent] = useState(false);

  const onSubmitClick = async () => {
    setLoading(true);

    try {
      // API call to report seller
    } catch (error) {
      console.log('Error reporting seller: ', error);
    }

    setTimeout(() => {
      setLoading(false);
      setRequestSent(true);
      inputRef.current.clear();
    }, 1500);
  };

  const inputRef = useRef(null);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {/* Header Section */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 8}}>
          <Icon name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Description Section */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginTop: 20,
        }}>
        <Text
          style={{
            fontSize: calculatedFontSize / 2.2,
            color: 'black',
            textAlign: 'center',
            width: '85%',
            lineHeight: 24,
            marginBottom: 20,
          }}>
          Provide a description of your issue, and we will get back to you on
          your registered email as soon as possible.
        </Text>

        <TextInput
          ref={inputRef}
          style={{
            width: '90%',
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 10,
            padding: 15,
            marginTop: 10,
            backgroundColor: '#f9f9f9',
            fontSize: calculatedFontSize / 2.5,
            color: 'black',
            textAlignVertical: 'top',
          }}
          placeholder="Write here..."
          placeholderTextColor={'gray'}
          inputMode="text"
          keyboardAppearance="light"
          returnKeyType="send"
          selectionColor={appPink}
          numberOfLines={8}
          multiline={true}
          maxLength={500}
        />
      </View>

      {/* Submit Button Section */}
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '15%',
        }}>
        {loading ? (
          <ActivityIndicator size="large" color={appPink} />
        ) : (
          <TouchableOpacity
            onPress={onSubmitClick}
            disabled={requestSent}
            style={{
              backgroundColor: requestSent ? 'gray' : appPink,
              borderRadius: 30,
              paddingVertical: 14,
              paddingHorizontal: 40,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 5,
              width: '80%',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.3,
              }}>
              {requestSent ? 'Sent' : 'Send'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
