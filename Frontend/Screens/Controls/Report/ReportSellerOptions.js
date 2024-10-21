import {useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../../Resources/Constants';

export default function ReportSellerOptions({route}) {
  const dispatch = useDispatch();
  const sellerUsername = route.params.sellerUsername;
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const renderSettingOption = (label, details) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ReportSeller', {label, sellerUsername})
      }
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        marginBottom: 8,
        borderRadius: 12,
      }}
      activeOpacity={0.8}>
      <View style={{flexDirection: 'column', paddingLeft: 12}}>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2.7,
          }}>
          {label}
        </Text>
        <Text
          style={{
            color: 'black',
            fontSize: calculatedFontSize / 2.9,
          }}>
          {details}
        </Text>
      </View>
      <Icon name="chevron-forward" size={24} color="black" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View style={{flexDirection: 'row', alignItems: 'center', padding: 4}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 5}}>
          <Icon name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <View style={{marginTop: 20, width: '100%'}}>
        {renderSettingOption(
          'Spam',
          'Not selling , using platform for other things',
        )}
        {renderSettingOption(
          'Inappropirate content',
          'Explicit content, nudity',
        )}
        {renderSettingOption(
          'Harassment',
          'Derogatory, sexual comment, hate speech',
        )}
        {renderSettingOption(
          'Selling prohibited items',
          'Drugs, counterfiets, weapons',
        )}
      </View>
    </SafeAreaView>
  );
}
