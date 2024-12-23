import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import {useCallback, useMemo, useState} from 'react';
import {Dimensions, Text, TouchableOpacity, View} from 'react-native';
import {appPink} from '../../../Resources/Constants';

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const CannotBidBottomSheet = ({
  cannotBidBottomSheetRef,
  isCannotBidBottomSheetVisible,
  setIsCannotBidBottomSheetVisible,
}) => {
  const [viewHeightPercentage, setViewHeightPercentage] = useState('20%');
  const navigation = useNavigation();

  const cannotBidSnapPoints = useMemo(
    () => ['1%', viewHeightPercentage],
    [viewHeightPercentage],
  );

  const handleCannotBidSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');
      //todo:get this function to work
      setIsCannotBidBottomSheetVisible(false);
    }
  }, []);

  return (
    <BottomSheet
      ref={cannotBidBottomSheetRef}
      snapPoints={cannotBidSnapPoints}
      index={isCannotBidBottomSheetVisible ? 1 : -1}
      onChange={handleCannotBidSheetChanges}>
      <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
        <View
          style={{
            alignItems: 'center',
            marginHorizontal: '4%',
            marginTop: 10,
          }}
          onLayout={event => {
            const {height} = event.nativeEvent.layout;
            if (height === 0) return;
            setViewHeightPercentage(`${((height + 50) / screenHeight) * 100}%`);
          }}>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: calculatedFontSize / 2.8,
            }}>
            For placing a bid, you need to add payment and shipping information
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: calculatedFontSize / 3,
            }}>
            You will not be charged until your bid is accepted. All bids placed
            are final.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddPaymentOrShipping')}
            style={{
              paddingVertical: '2%',
              width: '100%',
              backgroundColor: appPink,
              borderRadius: 40,
              marginTop: '6%',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontSize: calculatedFontSize / 2.2,
                fontWeight: 'bold',
              }}>
              Add Info
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default CannotBidBottomSheet;
