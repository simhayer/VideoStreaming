import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  StyleSheet,
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

const screenHeight = Dimensions.get('window').height;
const calculatedFontSize = screenHeight * 0.05;

const SetScheduleTime = ({route}) => {
  const {title, thumbnail, selectedItems} = route.params;
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const {userData} = useSelector(state => state.auth);
  const username = userData?.user?.username;

  const navigation = useNavigation();

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addingStream, setAddingStream] = useState(false);
  const [success, setSuccess] = useState(false);

  const onNextClick = async () => {
    if (date < Date.now()) {
      setIsError(true);
      setErrorMessage('Please select a future date and time');
      return;
    }

    setAddingStream(true);
    setIsError(false);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('title', title || 'Untitled');
    formData.append('products', selectedItems.join(','));
    formData.append('datetime', date.toISOString());

    if (thumbnail) {
      const imageFile = {
        uri: thumbnail,
        type: 'image/jpeg',
        name: 'thumbnail.jpg',
      };
      formData.append('thumbnail', imageFile);
    }

    try {
      const response = await axios.post(
        baseURL + apiEndpoints.addScheduledStream,
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );

      setAddingStream(false);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        navigation.navigate('Sell'); // Replace 'Home' with your home screen route name
      }, 2000);
    } catch (error) {
      setAddingStream(false);
      setIsError(true);
      setErrorMessage('Failed to add stream. Please try again.');
    }
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
      {addingStream && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={appPink} />
          <Text style={styles.overlayText}>Adding Stream...</Text>
        </View>
      )}

      {success && (
        <View style={styles.overlay}>
          <Icon name="checkmark-circle" size={70} color="green" />
          <Text style={styles.overlayText}>Stream Added Successfully!</Text>
        </View>
      )}

      {!addingStream && !success && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="chevron-back" size={35} color="black" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Set the time for the live</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.pickerButton}>
              <Text style={styles.pickerButtonText}>Select Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={styles.pickerButton}>
              <Text style={styles.pickerButtonText}>Select Time</Text>
            </TouchableOpacity>
            <Text style={styles.selectedDateText}>
              Selected Date: {date.toDateString()}
            </Text>
            <Text style={styles.selectedDateText}>
              Selected Time: {date.toLocaleTimeString()}
            </Text>
          </View>

          {isError && <Text style={styles.errorText}>{errorMessage}</Text>}

          <TouchableOpacity
            onPress={onNextClick}
            style={styles.nextButton}
            activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              textColor='black'
              accentColor='grey'
              themeVariant= 'dark'
              minimumDate={new Date(Date.now())}
              maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              textColor='black'
              accentColor='grey'
              themeVariant= 'dark'
              onChange={onTimeChange}
              minimumDate={new Date(Date.now())}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  title: {
    color: 'black',
    fontSize: calculatedFontSize / 2.8,
    marginTop: 20,
  },
  pickerContainer: {
    width: '85%',
    marginTop: '5%',
  },
  pickerButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  pickerButtonText: {
    color: 'black',
    fontSize: calculatedFontSize / 2.8,
  },
  selectedDateText: {
    color: 'grey',
    fontSize: calculatedFontSize / 2.9,
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: calculatedFontSize / 2.8,
    color: errorRed,
    marginTop: 10,
    textAlign: 'center',
  },
  nextButton: {
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
  },
  nextButtonText: {
    color: 'white',
    fontSize: calculatedFontSize / 2.2,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    opacity: 0.8,
  },
  overlayText: {
    color: 'white',
    fontSize: calculatedFontSize / 2.5,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default SetScheduleTime;
