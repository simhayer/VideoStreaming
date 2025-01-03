import {Dimensions, Text, TouchableOpacity, View} from 'react-native';
import {appPink} from '../Resources/Constants';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const BottomButton = ({loading, text, onPress}) => {
  return (
    <View
      style={{
        borderTopWidth: 2,
        borderColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: '4%',
        paddingTop: 10,
      }}>
      {loading ? (
        <ActivityIndicator size="large" color={appPink} />
      ) : (
        <TouchableOpacity
          onPress={onPress}
          style={{
            backgroundColor: appPink,
            borderRadius: 30,
            paddingVertical: 14,
            alignItems: 'center',
            marginHorizontal: '10%',
            marginTop: 10,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 4, // Subtle shadow for elevation
            marginBottom: 20,
          }}
          activeOpacity={0.8}>
          <Text
            style={{
              color: 'white',
              fontSize: calculatedFontSize / 2.4,
              fontWeight: 'bold',
            }}>
            {text}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default BottomButton;
