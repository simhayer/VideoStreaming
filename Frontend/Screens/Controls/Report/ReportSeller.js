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
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
} from '../../../Resources/Constants';
import axios from 'axios';

export default function ReportSeller({route}) {
  const sellerUsername = route.params.sellerUsername;
  const label = route.params.label;
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;
  const [description, setDescription] = useState('');

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const onSubmitClick = async () => {
    setLoading(true);

    try {
      try {
        const response = await axios.post(
          `${baseURL}${apiEndpoints.createReportUser}`,
          {
            email: userEmail,
            description: label + description,
            reportedUserEmail: sellerUsername,
          },
        );

        console.log('Response from reporting seller: ', response.data);
      } catch (error) {
        console.log('Error reporting seller: ', error);
      }
    } catch (error) {
      console.log('Error reporting seller: ', error);
    }

    setTimeout(() => {
      setLoading(false);
    }, 1000);

    navigation.navigate('Streams');
  };

  const inputRef = useRef(null);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View style={{flexDirection: 'row', alignItems: 'center', padding: 4}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 5}}>
          <Icon name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{fontSize: calculatedFontSize / 2.2, color: 'black'}}>
          Description
        </Text>
        <TextInput
          ref={inputRef}
          value={description}
          onChangeText={setDescription}
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
          maxLength={200}
        />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          marginBottom: '25%',
          width: '50%',
          alignSelf: 'center',
        }}>
        {loading ? (
          <ActivityIndicator size="large" color={appPink} />
        ) : (
          <TouchableOpacity
            onPress={onSubmitClick}
            style={{
              backgroundColor: appPink,
              borderRadius: 30,
              paddingVertical: 12,
              paddingHorizontal: 32,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 3,
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.5,
              }}>
              Submit
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
