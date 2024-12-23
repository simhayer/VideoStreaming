import {
  Dimensions,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink} from '../Resources/Constants';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const CommentInput = ({
  comment,
  handleCommentChange,
  handleSendComment,
  onControlsPressed,
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Adjust offset for iOS if needed
    >
      <View
        style={{
          width: '100%',
          justifyContent: 'space-between',
          minHeight: 50,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            width: '80%',
            marginLeft: '4%',
            borderWidth: 1,
            borderColor: 'white',
            width: '70%',
            marginLeft: '4%',
            borderRadius: 25,
            justifyContent: 'center',
            paddingLeft: '6%',
            paddingRight: '4%',
            elevation: 3,
            shadowColor: '#000', // Shadow for iOS
            shadowOpacity: 0.1,
            shadowRadius: 5,
            shadowOffset: {width: 0, height: 2},
          }}>
          <TextInput
            style={{
              borderRadius: 5,
              paddingHorizontal: '2%',
              color: 'white',
              width: '100%',
              fontSize: calculatedFontSize / 2.7,
              padding: 5,
            }}
            placeholder="Add a comment..."
            placeholderTextColor="#ccc"
            value={comment}
            onChangeText={handleCommentChange}
            returnKeyType="send"
            enterKeyHint="send"
            onSubmitEditing={handleSendComment}
            autoComplete="off"
            selectionColor={appPink}
            clearButtonMode="while-editing"
            keyboardAppearance="light"
          />
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={handleSendComment}>
            <Icon name="arrow-up-circle" size={35} color="white" />
          </TouchableOpacity>
        </View>
        <View style={{marginRight: 10}}>
          <TouchableOpacity style={{padding: 5}} onPress={onControlsPressed}>
            <Icon name="ellipsis-horizontal" size={35} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommentInput;
