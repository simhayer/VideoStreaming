import React, {useState, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  TextInput,
  Text,
} from 'react-native';
import {appPink, colors} from '../Resources/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import ListBroadcasts from './StreamViewer/ListBroadcasts';
import ListScheduledStreams from './ScheduleStream/ListScheduledStreams';
import commonStyles from '../Resources/styles';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const ViewerTab = () => {
  const [searchInput, setSearchInput] = useState(''); // Immediate input state
  const [hasSearched, setHasSearched] = useState(false);
  const [search, setSearch] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('Live');

  const statusTabs = ['Live', 'Upcoming'];

  const handleSearchChange = value => {
    setSearchInput(value);

    if (value.trim() === '' && hasSearched) {
      console.log('Search input is empty');
      setSearch('');
    }
  };

  const triggerSearch = useCallback(() => {
    if (searchInput.trim() !== '') {
      setSearch(searchInput);
      setHasSearched(true);
    }
  }, [searchInput]);

  const renderListBroadcasts = useCallback(() => {
    console.log('Rendering ListBroadcasts');
    return <ListBroadcasts search={search} hasSearched={hasSearched} />;
  }, [search, hasSearched]);

  const renderListScheduledStreams = useCallback(() => {
    console.log('Rendering ListScheduledStreams');
    return <ListScheduledStreams search={search} hasSearched={hasSearched} />;
  }, [search, hasSearched]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View
        style={[
          commonStyles.searchBar,
          {marginHorizontal: 10, marginTop: 16, width: '95%'},
        ]}>
        <Icon name="search" size={24} color="grey" />
        <TextInput
          style={{
            flex: 1,
            fontSize: calculatedFontSize / 3,
            paddingVertical: 10,
            paddingHorizontal: 8,
            color: 'black',
          }}
          placeholder="Search streams..."
          placeholderTextColor="grey"
          value={searchInput}
          onChangeText={handleSearchChange}
          onSubmitEditing={triggerSearch}
          returnKeyType="search"
          maxLength={30}
          selectionColor={appPink}
          keyboardAppearance="light"
        />
        <TouchableOpacity onPress={triggerSearch} activeOpacity={0.8}>
          <Icon
            name="arrow-up-circle"
            size={30}
            color={searchInput == '' ? 'grey' : 'black'}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs for Viewer Tab */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 10,
          borderBottomWidth: 2,
          borderColor: 'rgba(0,0,0,0.1)',
        }}>
        {statusTabs.map(status => (
          <TouchableOpacity
            key={status}
            onPress={() => setSelectedStatus(status)}
            style={{
              marginHorizontal: 20,
              backgroundColor: 'white',
              minHeight: 40,
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              borderBottomWidth: selectedStatus === status ? 2 : 0,
              borderColor: selectedStatus === status ? 'black' : 'grey',
            }}>
            <Text
              style={{
                color: selectedStatus === status ? 'black' : 'grey',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.9,
              }}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedStatus === 'Live'
        ? renderListBroadcasts()
        : renderListScheduledStreams()}
    </SafeAreaView>
  );
};

export default ViewerTab;
