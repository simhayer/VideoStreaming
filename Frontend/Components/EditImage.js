import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../Resources/Constants';
import {setAddProductImage} from '../Redux/Features/AddProductImagesSlice';
import {useDispatch, useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const EditImage = ({route}) => {
  const {index} = route.params; // Safe to pass
  const image = useSelector(state => state.addProductImages.images[index]);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const removeImage = () => {
    dispatch(setAddProductImage({index, image: null}));
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={{flex: 1, paddingTop: 10, backgroundColor: colors.background}}>
      <View style={{flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 4,
            paddingHorizontal: '2%',
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
            Edit Photo
          </Text>
          <TouchableOpacity onPress={removeImage}>
            <Icon name="trash-outline" size={35} color="black" />
          </TouchableOpacity>
        </View>
        <View style={{alignItems: 'center', marginTop: 10, flex: 1}}>
          <FastImage
            source={{uri: image}}
            style={{
              flex: 1,
              width: '90%',
              marginVertical: '15%',
            }}
            resizeMode="contain"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditImage;
