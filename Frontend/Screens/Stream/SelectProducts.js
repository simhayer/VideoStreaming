import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {appPink, baseURL, colors, errorRed} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';
import {fetchProducts} from '../../Redux/Features/ProductsSlice';

const SelectProducts = ({route}) => {
  const {title, type} = route.params;
  //const [title, setTitle] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;
  const {items} = useSelector(state => state.products);

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelectItem = item => {
    setSelectedItems(prevSelectedItems => {
      if (prevSelectedItems.includes(item._id)) {
        return prevSelectedItems.filter(id => id !== item._id);
      } else {
        return [...prevSelectedItems, item._id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
    setSelectAll(!selectAll);
  };

  const onNextClick = async () => {
    if (selectedItems.length === 0) {
      setIsError(true);
      setErrorMessage('Select at least one item');
      return;
    }

    navigation.navigate('SelectThumbnail', {title, type, selectedItems});
  };

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
        }}>
        Select items that you will be selling in this live
      </Text>
      {/* Select All Section */}
      <TouchableOpacity
        onPress={toggleSelectAll}
        style={{
          padding: 5,
          width: '95%',
          alignSelf: 'center',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
        <Text style={{fontSize: calculatedFontSize / 2.7, marginRight: 5}}>
          Select all
        </Text>
        <Icon
          name={selectAll ? 'checkmark-circle-outline' : 'ellipse-outline'}
          size={27}
          color="black"
        />
      </TouchableOpacity>
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
        }}>
        <FlatList
          style={{flex: 1, maxHeight: '100%'}}
          data={items}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            if (!item.imageUrl) return null;
            const isSelected = selectedItems.includes(item._id);
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
                  source={{uri: item.localImagePath}}
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
                    }}>
                    {item.name}
                  </Text>
                  <Text style={{fontSize: calculatedFontSize / 2.9}}>
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
      </View>
      <TouchableOpacity
        onPress={onNextClick}
        style={{
          backgroundColor: appPink,
          borderRadius: 30,
          paddingVertical: 14,
          alignItems: 'center',
          width: '80%',
          marginTop: 40,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.2,
          shadowRadius: 4, // Subtle shadow for elevation
          marginBottom: 40,
        }}
        activeOpacity={0.8}>
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

export default SelectProducts;
