import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {baseURL, colors} from '../../Resources/Constants';
import FastImage from 'react-native-fast-image';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ListScheduledStreamItem = ({item, profilePictureURL}) => {
  const navigation = useNavigation();

  const handleWatchVideoSDK = (item, profilePictureURL) => {
    navigation.navigate('ScheduledStreamViewer', {
      scheduledStreamItem: item,
      profilePictureURL: profilePictureURL,
    });
  };

  const [imageLoaded, setImageLoaded] = useState(false);
  const profilePictureFilename = profilePictureURL.split('/').pop();
  const thumbnailUri = `${baseURL}/thumbnail/${item.thumbnail}`;

  const now = new Date();
  const diff = new Date(item.date) - now; // Time difference in milliseconds

  if (diff <= 0) {
    return null; // Stream has started
  }

  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  var timeLeftString = ``;

  if (days > 0) {
    timeLeftString = `In ${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    timeLeftString = `In ${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    timeLeftString = `In ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  return (
    <View
      style={{
        width: '48%',
        height: screenHeight * 0.35,
        marginBottom: '23%',
        marginRight: '4%',
      }}>
      <View style={styles.row}>
        <FastImage
          source={
            profilePictureFilename !== ''
              ? {uri: profilePictureURL}
              : require('../../Resources/user.png')
          }
          defaultSource={require('../../Resources/user.png')}
          style={styles.profilePicture}
        />
        <Text
          style={{
            fontSize: calculatedFontSize / 2.7,
            fontWeight: 'bold',
            maxWidth: '48%',
            color: colors.black,
          }}>
          {item.username}
        </Text>
      </View>
      <TouchableOpacity
        key={item.id}
        title={`Watch ${item.id}`}
        style={styles.buttonContainer}
        onPress={() =>
          handleWatchVideoSDK(item, profilePictureURL, navigation)
        }>
        <FastImage
          source={
            imageLoaded
              ? {uri: thumbnailUri}
              : require('../../Resources/StreamListThumbnailBlur.png')
          }
          style={{width: '100%', height: '100%', borderRadius: 7}}
          imageStyle={{borderRadius: 7}}
          onLoadEnd={() => setImageLoaded(true)}>
          <View
            style={{
              backgroundColor: 'red',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 5,
              alignSelf: 'flex-start',
              margin: 8,
            }}>
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.9,
              }}>
              {timeLeftString}
            </Text>
          </View>
        </FastImage>
      </TouchableOpacity>
      <Text
        style={{
          fontSize: calculatedFontSize / 2.8,
          color: colors.black,
          fontWeight: 'bold',
          marginVertical: 1,
        }}
        numberOfLines={2}
        ellipsizeMode="tail">
        {item.title.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '4%',
    height: '9%',
    width: '100%',
  },
  profilePicture: {
    width: 20,
    height: 20,
    borderRadius: 25,
    marginRight: '5%',
  },
  buttonContainer: {
    width: '100%',
    height: '100%',
    marginBottom: '2%',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ListScheduledStreamItem;
