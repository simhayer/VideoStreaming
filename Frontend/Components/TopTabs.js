import {Dimensions, FlatList, Text, TouchableOpacity, View} from 'react-native';

const {height: screenHeight} = Dimensions.get('window');
const calculatedFontSize = screenHeight * 0.05;

const TopTabs = ({tabs, selectedTab, setSelectedTab, selectedTabChanged}) => {
  const selectedTabChangedFunc = item => {
    setSelectedTab(item);
    selectedTabChanged(item);
  };

  return (
    <View
      style={{
        borderBottomWidth: 2,
        borderColor: 'rgba(0,0,0,0.1)',
      }}>
      <FlatList
        data={tabs}
        horizontal // Enables horizontal scrolling
        showsHorizontalScrollIndicator={false} // Hides the scroll indicator
        contentContainerStyle={{paddingHorizontal: 10}}
        keyExtractor={item => item}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => selectedTabChangedFunc(item)}
            style={{
              paddingHorizontal: 20,
              backgroundColor: 'white',
              minHeight: 40,
              justifyContent: 'center',
              alignItems: 'center',
              borderBottomWidth: selectedTab === item ? 2 : 0,
              borderColor: selectedTab === item ? 'black' : 'grey',
            }}>
            <Text
              style={{
                color: selectedTab === item ? 'black' : 'grey',
                fontWeight: 'bold',
                fontSize: calculatedFontSize / 2.7,
              }}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default TopTabs;
