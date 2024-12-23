import MaskedView from '@react-native-masked-view/masked-view';
import {Dimensions, FlatList, Image, Pressable, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {baseURL} from '../../Resources/Constants';
import FastImage from 'react-native-fast-image';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const CommentSection = ({comments, scrollViewRef}) => {
  return (
    <MaskedView
      style={{flex: 1}}
      maskElement={
        <LinearGradient
          style={{flex: 1}}
          colors={['transparent', 'white', 'white', 'white']}
        />
      }>
      <FlatList
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
        data={comments}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => {
          const profilePictureFilename = item.userProfilePicture
            .split('/')
            .pop();

          const profilePictureURL = `${baseURL}/profilePicture/thumbnail/${profilePictureFilename}`;
          return (
            <Pressable
              style={{
                flex: 1,
                height: '20%',
                width: '70%',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: '2%',
                }}>
                <FastImage
                  source={{uri: profilePictureURL}}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    marginRight: '5%',
                    marginLeft: '5%',
                    marginTop: '3%',
                    alignSelf: 'flex-start',
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <View>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: calculatedFontSize / 3.1,
                      textShadowColor: '#000', // Shadow color
                      textShadowOffset: {width: 1, height: 1}, // Shadow offset
                      textShadowRadius: 3, // Shadow blur
                      elevation: 5,
                    }}>
                    {item.userUsername}
                  </Text>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: calculatedFontSize / 3.1,
                      fontWeight: '600',
                      textShadowColor: '#000', // Shadow color
                      textShadowOffset: {width: 1, height: 1}, // Shadow offset
                      textShadowRadius: 3, // Shadow blur
                      elevation: 5,
                      flexWrap: 'wrap',
                    }}>
                    {item.comment}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        contentContainerStyle={{
          flexGrow: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      />
    </MaskedView>
  );
};

export default CommentSection;
