import {StyleSheet} from 'react-native';

const commonStyles = StyleSheet.create({
  signupScreens: {
    backgroundColor: 'white',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  input: {
    width: '100%',
    // paddingTop: 10,
    borderBottomWidth: 1,
    borderColor: 'black',
    // marginBottom: 10,
  },
  button: {
    // Add button styles if needed
  },
  authInput: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: 'black',
    marginTop: 10,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    color: 'black',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 4,
    backgroundColor: '#f9f9f9', // Subtle background for better visibility
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 50,
    width: '100%',
  },
});

export default commonStyles;
