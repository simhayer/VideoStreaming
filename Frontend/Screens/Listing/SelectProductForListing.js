import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {appPink, baseURL, colors, errorRed} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';
import {fetchProducts} from '../../Redux/Features/ProductsSlice';
import BottomButton from '../../Components/BottomButton';

const SelectProductForListing = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;
  const {items, reduxLoading} = useSelector(state => state.products);

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const [selectedItem, setSelectedItem] = useState(null);

  const toggleSelectItem = item => {
    setSelectedItem(item);
  };

  const onNextClick = async () => {
    if (selectedItem === null) {
      setIsError(true);
      setErrorMessage('Select an item to continue');
      return;
    }

    navigation.navigate('SubmitListing', {product: selectedItem});
  };

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchProducts(userEmail));
    }
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
          }}></Text>
        <View style={{width: 35}} />
      </View>
      <Text
        style={{
          color: 'black',
          fontSize: calculatedFontSize / 2.8,
          marginTop: 20,
          marginHorizontal: 40,
          textAlign: 'center',
        }}>
        Select an item that you want to list on the marketplace
      </Text>
      {isError && (
        <Text
          style={{
            fontSize: calculatedFontSize / 2.8,
            color: errorRed,
            marginTop: 5,
            marginBottom: 5,
            textAlign: 'center',
          }}>
          {errorMessage}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          flex: 1,
          marginTop: 20,
        }}>
        {reduxLoading ? (
          <ActivityIndicator
            size="large"
            color={appPink}
            style={{marginVertical: 20}}
          />
        ) : (
          <FlatList
            style={{flex: 1, maxHeight: '100%'}}
            data={items}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              if (!item.imageUrl) return null;
              const isSelected = selectedItem?._id === item._id;
              return (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.2)',
                    paddingRight: 25,
                    justifyContent: 'space-between',
                    backgroundColor: isSelected ? '#d3d3d3' : 'white',
                  }}
                  onPress={() => toggleSelectItem(item)}>
                  <FastImage
                    source={{uri: item.localImagePaths[0]}}
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 8,
                      margin: 5,
                      marginLeft: 10,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        textAlign: 'left',
                        flexWrap: 'wrap',
                        fontSize: calculatedFontSize / 2.7,
                        color: 'black',
                      }}>
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: calculatedFontSize / 2.9,
                        color: 'grey',
                      }}>
                      {item.size}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{
              paddingBottom: 10, // Add padding to avoid the last item being cut off
            }}
          />
        )}
      </View>
      <View style={{width: '100%'}}>
        <BottomButton loading={false} text="Next" onPress={onNextClick} />
      </View>
    </SafeAreaView>
  );
};

export default SelectProductForListing;
