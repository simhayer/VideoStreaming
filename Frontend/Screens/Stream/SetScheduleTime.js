import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import {
  apiEndpoints,
  appPink,
  baseURL,
  colors,
  errorRed,
} from '../../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {useSelector} from 'react-redux';

const SetScheduleTime = ({route}) => {
  const {title, type, thumbnail, selectedItems} = route.params;
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const {userData} = useSelector(state => state.auth);

  const username = userData?.user?.username;
  const profilePicture = userData?.user?.profilePicture;

  const navigation = useNavigation();

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addingStream, setAddingStream] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const calculatedFontSize = screenHeight * 0.05;

  const onNextClick = async () => {
    if (date < Date.now()) {
      setIsError(true);
      setErrorMessage('Please select a future date and time');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('title', title || 'Untitled');
    formData.append('products', selectedItems.join(','));
    formData.append('datetime', date.toISOString());

    // Check if a thumbnail is selected
    if (thumbnail) {
      // Convert the file URI to a file object
      const imageFile = {
        uri: thumbnail,
        type: 'image/jpeg',
        name: 'thumbnail.jpg',
      };
      formData.append('thumbnail', imageFile);
    }

    console.log('Adding stream schedule:', formData);

    axios
      .post(baseURL + apiEndpoints.addScheduledStream, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        console.log('Stream Schedule added:', response.data);
      })
      .catch(error => {
        console.error('Error adding stream schedule:', error);
      });
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(false);
    setDate(currentTime);
  };

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
      </View>
      <Text
        style={{
          color: 'black',
          fontSize: calculatedFontSize / 2.8,
          marginTop: 20,
        }}>
        Set the time for the live
      </Text>
      <View style={{width: '85%', marginTop: '5%'}}>
        {/* Date Picker Button */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={{
            marginTop: 20,
            padding: 15,
            borderRadius: 10,
            backgroundColor: '#f0f0f0',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: 'black',
              fontSize: calculatedFontSize / 2.8,
            }}>
            Select Date
          </Text>
        </TouchableOpacity>
        {/* Time Picker Button */}
        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={{
            marginTop: 10,
            padding: 15,
            borderRadius: 10,
            backgroundColor: '#f0f0f0',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: 'black',
              fontSize: calculatedFontSize / 2.8,
            }}>
            Select Time
          </Text>
        </TouchableOpacity>
        {/* Display Selected Date and Time */}
        <Text
          style={{
            color: 'grey',
            fontSize: calculatedFontSize / 2.9,
            textAlign: 'center',
            marginTop: 20,
          }}>
          Selected Date: {date.toDateString()}
        </Text>
        <Text
          style={{
            color: 'grey',
            fontSize: calculatedFontSize / 2.9,
            textAlign: 'center',
            marginTop: 1,
          }}>
          Selected Date: {date.toLocaleTimeString()}
        </Text>
      </View>

      {isError && (
        <Text
          style={{
            fontSize: calculatedFontSize / 2.8,
            color: errorRed,
            marginTop: 10,
            textAlign: 'center',
          }}>
          {errorMessage}
        </Text>
      )}
      <TouchableOpacity
        onPress={onNextClick}
        style={{
          backgroundColor: appPink,
          borderRadius: 30,
          paddingVertical: 14,
          alignItems: 'center',
          width: '80%',
          marginTop: '12%',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.2,
          shadowRadius: 4,
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
      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={Date.now()}
          maximumDate={Date.now() + 7 * 24 * 60 * 60 * 1000}
        />
      )}
      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          minimumDate={Date.now()}
        />
      )}
    </SafeAreaView>
  );
};

export default SetScheduleTime;
