import { StatusBar } from 'expo-status-bar';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { MapPinIcon } from 'react-native-heroicons/solid'
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '../constants';
import { theme } from '../theme';
import { getData, storeData } from '../utils/asynStorage';

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({})


  const handleSearch = (search) => {
    // console.log('value: ',search);
    if (search && search.length > 2)
      fetchLocations({ cityName: search }).then((data) => {
        // console.log('got locations: ',data);
        setLocations(data);
      });
  }

  const handleLocation = (loc) => {
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then((data) => {
      setLoading(false);
      setWeather(data);
      storeData('city', loc.name);
    })
  }

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    const myCity = await getData('city');
    let cityName = 'chennai';
    if (myCity) {
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then((data) => {
      console.log('got data: ', data.forecast.forecastday);
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { location, current } = weather;

  return (
    <View className="relative flex-1">
      <StatusBar style="light" />
      <Image
        blurRadius={90} 
        source={require('../assets/images/bg.png')}
        className="absolute h-full w-full"
      />
      {loading ? (
        <View className="flex-1 flex-row items-center justify-center">
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          {/* search section */}
          <View style={{ height: '7%' }} className="relative z-50 mx-4">
            <View
              className="flex-row items-center justify-end rounded-full"
              style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}>
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor={'lightgray'}
                  className="h-10 flex-1 pb-1 pl-6 text-base text-white"
                />
              ) : null}
              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                className="m-1 rounded-full p-3"
                style={{ backgroundColor: theme.bgWhite(0.3) }}>
                {showSearch ? (
                  <XMarkIcon size="25" color="white" />
                ) : (
                  <MagnifyingGlassIcon size="25" color="white" />
                )}
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View className="absolute top-16 w-full rounded-3xl bg-gray-300 ">
                {locations.map((loc, index) => {
                  const showBorder = index + 1 != locations.length;
                  const borderClass = showBorder ? ' border-b-2 border-b-gray-400' : '';
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleLocation(loc)}
                      className={'mb-1 flex-row items-center border-0 p-3 px-4 ' + borderClass}>
                      <MapPinIcon size="20" color="gray" />
                      <Text className="ml-2 text-lg text-black">
                        {loc?.name}, {loc?.country}
                        </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* forecast section */}
          <View className="mx-4 mb-2 flex flex-1 justify-around">
            {/* location */}
            <Text className="text-center text-2xl font-bold text-white">
              {location?.name},
              <Text className="text-lg font-semibold text-gray-300">{location?.country}</Text>
            </Text>
            {/* weather icon */}
            <View className="flex-row justify-center">
              <Image
                // source={{uri: 'https:'+current?.condition?.icon}}
                source={weatherImages[current?.condition?.text || 'other']}
                className="h-52 w-52" />
              
                </View>
                {/* degree celcius */}
                <View className="space-y-2">
              <Text className="ml-5 text-center text-6xl font-bold text-white">
                      {current?.temp_c}&#176;
                    </Text>
              <Text className="text-center text-xl tracking-widest text-white">
                      {current?.condition?.text}
                    </Text>
                </View>

            
          </View>

          
        </SafeAreaView>
      )}
    </View>
  )
}
