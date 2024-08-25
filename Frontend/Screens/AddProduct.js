import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  appPink,
  productTypes,
  shoeSizeOptions,
  clothingSizeOptions,
  baseURL,
  apiEndpoints,
} from '../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios'; // Import axios
import {useSelector} from 'react-redux';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const StartStreamTab = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');

  const {userData, isLoading} = useSelector(state => state.auth);
  const userEmail = userData?.user?.email;

  const [itemName, setItemName] = useState('');

  const [typeOpen, setTypeOpen] = useState(false);
  const [type, setType] = useState('');

  const [sizeOpen, setSizeOpen] = useState(false);
  const [size, setSize] = useState('');

  const showSizeOption = useMemo(() => {
    return type === 'Clothing' || type === 'Footwear';
  }, [type]);

  const sizeOptions = useMemo(() => {
    if (type === 'Clothing') return clothingSizeOptions;
    if (type === 'Footwear') return shoeSizeOptions;
    return [];
  }, [type]);

  // Define the addProduct function to send the POST request
  const addProduct = async () => {
    try {
      const payload = {
        email: userEmail,
        product: {
          name: itemName,
          size: size,
          type: type,
        },
      };

      // Make the POST request to your backend
      const response = await axios.post(
        baseURL + apiEndpoints.addProductToUser,
        payload,
      );

      if (response.status === 200) {
        console.log('Product added successfully:', response.data);
        navigation.goBack();
        // Handle success (e.g., navigate back, show a success message, etc.)
      } else {
        console.error('Failed to add product:', response.data);
        // Handle failure (e.g., show an error message)
      }
    } catch (error) {
      console.error('Error adding product:', error);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <SafeAreaView style={{flex: 1, paddingTop: '2%'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={40} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: calculatedFontSize / 2,
            marginLeft: '25%',
          }}>
          Add product
        </Text>
      </View>
      <View style={{alignItems: 'center', marginTop: '15%'}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="reader-outline" size={40} color="black" />
          <TextInput
            value={itemName}
            onChangeText={itemName => setItemName(itemName.trim())}
            placeholder={'Enter item name'}
            style={{
              width: '70%',
              borderBottomWidth: 1,
              borderColor: 'grey',
              fontSize: calculatedFontSize / 2.3,
              marginBottom: '2%',
              marginLeft: '4%',
            }}
          />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="albums-outline" size={40} color="black" />
          <DropDownPicker
            open={typeOpen}
            value={type}
            items={productTypes}
            setOpen={setTypeOpen}
            setValue={setType}
            containerStyle={{
              height: '32%',
              justifyContent: 'center',
              width: '70%',
              marginLeft: '4%',
            }}
            labelStyle={{
              fontWeight: 'bold',
            }}
            dropDownContainerStyle={{
              borderColor: 'black',
            }}
            listItemLabelStyle={{
              fontWeight: 'bold',
            }}
            zIndex={1000}
          />
        </View>
        {showSizeOption && (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="filter-outline" size={40} color="black" />
            <DropDownPicker
              open={sizeOpen}
              value={size}
              items={sizeOptions}
              setOpen={setSizeOpen}
              setValue={setSize}
              flatListProps={{nestedScrollEnabled: true}}
              scrollViewProps={{nestedScrollEnabled: true}}
              containerStyle={{
                height: '32%',
                maxHeight: '32%',
                justifyContent: 'center',
                width: '70%',
                marginLeft: '4%',
              }}
              labelStyle={{
                fontWeight: 'bold',
              }}
              dropDownContainerStyle={{
                borderColor: 'black',
              }}
              listItemLabelStyle={{
                fontWeight: 'bold',
              }}
              zIndex={900}
            />
          </View>
        )}
        <TouchableOpacity
          onPress={addProduct} // Call addProduct on button press
          style={{
            backgroundColor: appPink,
            borderRadius: 40,
            paddingVertical: '4%',
            marginHorizontal: '10%',
            marginTop: 20,
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontWeight: 'bold',
              paddingHorizontal: '10%',
            }}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StartStreamTab;
