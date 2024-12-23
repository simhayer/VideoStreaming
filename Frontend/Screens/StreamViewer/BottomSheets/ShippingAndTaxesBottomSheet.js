import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {Dimensions, Text, View} from 'react-native';
import {useCallback, useMemo} from 'react';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ShippingAndTaxesBottomSheet = ({
  shippingAndTaxesBottomSheetRef,
  shippingAndTaxesBottomSheetVisible,
  setShippingAndTaxesBottomSheetVisible,
  isTimerRunning,
  bidItem,
}) => {
  const shippingAndTaxesSnapPoints = useMemo(() => ['1%', '35%'], []);

  const handleShippingAndTaxesSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
    if (index === 0) {
      console.log('Closing bottom sheet');

      setShippingAndTaxesBottomSheetVisible(false);
    }
  }, []);

  return (
    <BottomSheet
      ref={shippingAndTaxesBottomSheetRef}
      snapPoints={shippingAndTaxesSnapPoints}
      index={shippingAndTaxesBottomSheetVisible ? 1 : -1}
      onChange={handleShippingAndTaxesSheetChanges}>
      <BottomSheetView style={{flexDirection: 'column', flex: 1}}>
        <View
          style={{
            marginHorizontal: '5%',
            marginTop: 20,
          }}>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.4,
              color: colors.black,
              marginTop: 5,
              fontWeight: 'bold',
            }}>
            Shipping
          </Text>
          {isTimerRunning && (
            <Text
              style={{
                fontSize: calculatedFontSize / 2.7,
                color: colors.black,
                marginTop: 5,
              }}>
              🇨🇦 Shipping fee for this item : $ {bidItem?.shippingFee}
            </Text>
          )}
          <Text
            style={{
              fontSize: calculatedFontSize / 2.9,
              color: colors.black,
              marginTop: 10,
            }}>
            Shipping fee is not included in the bid price. Items bought from the
            same seller in the same session will be bundled together to get a
            minimum shipping fee
          </Text>
        </View>

        <View
          style={{
            marginHorizontal: '5%',
            marginTop: 20,
          }}>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.4,
              color: colors.black,
              fontWeight: 'bold',
            }}>
            Taxes
          </Text>
          <Text
            style={{
              fontSize: calculatedFontSize / 2.9,
              color: colors.black,
              marginTop: 5,
            }}>
            Standard sales tax will be applied to the total order amount
          </Text>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default ShippingAndTaxesBottomSheet;
