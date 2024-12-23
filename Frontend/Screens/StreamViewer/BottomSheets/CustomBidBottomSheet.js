import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink} from '../../../Resources/Constants';
import {useCallback, useMemo} from 'react';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const CustomBidBottomSheet = ({
  bidBottomSheetRef,
  isBidBottomSheetVisible,
  setIsBidBottomSheetVisible,
  curBid,
  userBid,
  setUserBid,
  handleSendCustomBid,
  timeLeft,
}) => {
  const snapPoints = useMemo(() => ['1%', '30%'], []);

  const handleSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');
      //todo:get this function to work
      setIsBidBottomSheetVisible(false);
    }
  }, []);

  return (
    <BottomSheet
      ref={bidBottomSheetRef}
      snapPoints={snapPoints}
      index={isBidBottomSheetVisible ? 1 : -1}
      onChange={handleSheetChanges}>
      <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
        <View style={{flexDirection: 'column', marginTop: 2}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: calculatedFontSize / 2,
              }}>
              Current Bid:{'     '}
            </Text>
            <Text
              style={{
                fontSize: calculatedFontSize / 1.4,
              }}>
              ${curBid}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 40,
            }}>
            <Text
              style={{
                fontSize: calculatedFontSize / 1.4,
              }}>
              ${' '}
            </Text>
            <TextInput
              placeholder="Enter Bid"
              keyboardType="numeric"
              maxLength={5}
              textAlign="center"
              value={userBid}
              onChangeText={text => {
                const numericValue = text.replace(/[^0-9]/g, '');
                setUserBid(numericValue);
              }}
              style={{
                width: '30%',
                borderBottomWidth: 1,
                textAlign: 'center',
                fontSize: calculatedFontSize / 2.5,
                minHeight: 50,
              }}
              autoComplete="off"
              autoCapitalize="none"
              placeholderTextColor={'gray'}
              autoCorrect={false}
              returnKeyType="done"
              selectionColor={appPink}
              clearButtonMode="while-editing"
              keyboardAppearance="light"
            />
            <TouchableOpacity
              onPress={handleSendCustomBid}
              disabled={userBid <= curBid}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: '10%',
                marginTop: '2%',
                opacity: userBid <= curBid ? 0.5 : 1,
              }}>
              <Icon
                name="arrow-up-circle"
                size={40}
                color={userBid <= curBid ? 'gray' : '#f542a4'}
              />
            </TouchableOpacity>
          </View>
          <View style={{alignItems: 'center'}}>
            <Text
              style={{
                color: 'red',
                marginTop: '5%',
              }}>
              Time Left: {timeLeft} s
            </Text>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default CustomBidBottomSheet;
