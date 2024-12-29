import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {appPink, colors, errorRed} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';
import {fetchProducts} from '../../Redux/Features/ProductsSlice';
import {productTypesMap} from '../../Resources/Constants';
import {
  logout,
  updateInterestedCategories,
} from '../../Redux/Features/AuthSlice';

const SelectCategories = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;
  const {items, reduxLoading} = useSelector(state => state.products);

  const {userData} = useSelector(state => state.auth);

  const userEmail = userData?.user?.email;

  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      // Go back safely
      navigation.goBack();
    } else {
      //console.log('In log out');
      dispatch(logout()); // Log the user out
    }
    return true; // Prevent default behavior
  };

  useEffect(() => {
    // Add back press listener
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove(); // Clean up listener
  }, []);

  const toggleSelectItem = item => {
    setSelectedItems(prevSelectedItems => {
      if (prevSelectedItems.includes(item.name)) {
        return prevSelectedItems.filter(name => name !== item.name);
      } else if (prevSelectedItems.length < 5) {
        return [...prevSelectedItems, item.name];
      } else {
        return prevSelectedItems;
      }
    });
  };

  const onNextClick = async () => {
    if (selectedItems.length < 3) {
      setIsError(true);
      setErrorMessage('Select at least 3 categories');
      return;
    }

    setLoading(true);

    const payload = {
      email: userEmail,
      interestedCategories: selectedItems,
    };

    dispatch(updateInterestedCategories(payload))
      .unwrap()
      .then(() => {
        console.log('Interested categories successfully');
        setLoading(false);
        //navigation.goBack();
      })
      .catch(err => {
        console.error('Error:', err);
        setIsError(true);
        setErrorMessage(
          err.data?.message || 'Could not update categories. Please try again.',
        );
        setLoading(false);
        //navigation.goBack();
      });
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
        <TouchableOpacity onPress={handleBackPress}>
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
          marginHorizontal: '5%',
          textAlign: 'center',
        }}>
        Select upto 5 Categories that you are interested in.
      </Text>
      {/* Select All Section */}
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          paddingHorizontal: 10,
          marginTop: 10,
        }}>
        <Text
          style={{
            fontSize: calculatedFontSize / 2.7,
            marginRight: 5,
            color: 'gray',
          }}>
          {selectedItems.length}/5 selected
        </Text>
      </View>
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
        {reduxLoading ? (
          <ActivityIndicator
            size="large"
            color={appPink}
            style={{marginVertical: 20}}
          />
        ) : (
          <ScrollView
            contentContainerStyle={{
              flexDirection: 'row',
              flexWrap: 'wrap', // Enables wrapping behavior
              padding: 10,
            }}
            showsVerticalScrollIndicator={false}>
            {productTypesMap.map(item => {
              const isSelected = selectedItems.includes(item.name);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderRadius: 40,
                    borderColor: 'rgba(0,0,0,0.2)',
                    justifyContent: 'space-between',
                    backgroundColor: isSelected ? '#d3d3d3' : 'white',
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                    margin: 5, // Space between items
                  }}
                  onPress={() => toggleSelectItem(item)}>
                  <FastImage
                    source={item.image}
                    style={{
                      width: 28,
                      height: 28,
                      marginRight: 10,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: calculatedFontSize / 3.1,
                      color: 'black',
                    }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={appPink}
          style={{marginVertical: 20}}
        />
      ) : (
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
            Done
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default SelectCategories;
