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
    return <ListBroadcasts search={search} hasSearched={hasSearched} />;
  }, [search, hasSearched]);

  const renderListScheduledStreams = useCallback(() => {
    return <ListScheduledStreams search={search} hasSearched={hasSearched} />;
  }, [search, hasSearched]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 10,
          marginTop: 16,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.2)',
          borderRadius: 12,
          paddingHorizontal: 10,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
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
