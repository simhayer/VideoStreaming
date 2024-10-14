import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {appPink} from '../../Resources/Constants';

const AuthButton = ({iconName, text, onPress, loading}) => {
  if (loading) {
    return (
      <View style={styles.buttonContainer}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.buttonContainer}
      activeOpacity={0.8}>
      <Icon name={iconName} size={30} color="black" />
      <Text style={styles.buttonText}>{text}</Text>
      <View style={{width: 30}} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appPink,
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 10,
    justifyContent: 'space-between',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
});

export default AuthButton;
