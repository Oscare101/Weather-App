import React, { useEffect, useState } from 'react'
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  Keyboard,
  Image,
  FlatList,
  ScrollView,
} from 'react-native'
import colors from '../constans/colors'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused } from '@react-navigation/native'
const apiKey = 'de58dbed94b4367837c1196fc4928c14'
const kelvin = 273.15

interface WeatherListInterface {
  main?: any
  weather?: any
  dt_txt?: any
  wind?: any
}

interface WeatherInterface {
  list?: WeatherListInterface[]
  city?: any
}

export default function WeatherScreen({ route, navigation }: any) {
  //   const { coord: any } = route.params
  const isFocused = useIsFocused()
  const [city, setCity] = useState('') // save user city
  const [forecast, setForecast] = React.useState<WeatherInterface>() // save forecast data
  const [error, setError] = useState('') // show error
  const [temp, setTemp] = useState('celsius')
  const [loading, setLoading] = useState(false)
  const [buttonDissabled, setButtonDissabled] = useState(false)

  async function GetWeatherByXY(X: string, Y: string) {
    setForecast({})
    const responseForecast = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${X}&lon=${Y}&appid=${apiKey}`
    )
    const dataForecast = await responseForecast.json()

    setForecast(dataForecast)
    setLoading(false)
    const location = await AsyncStorage.getItem('locations')
    if (location?.includes(dataForecast.city.id)) {
      setButtonDissabled(true)
    }
  }

  async function GetWeather() {
    setLoading(true)
    setButtonDissabled(false)

    const responseCity = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`
    )
    const dataCity = await responseCity.json() // get city XY

    if (dataCity.cod === '400') {
      setError(`Type a city name`)
      return false
    } else if (!dataCity[0]) {
      setError(`There's no such city`)
      return false
    }
    GetWeatherByXY(dataCity[0].lat, dataCity[0].lon)
  }

  function RenderForecastItem({ item }: any) {
    return (
      <View style={styles.hourlyWeatherBlock}>
        <Image
          source={{
            uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          }}
          style={{ width: 50, height: 50 }}
        />
        <Text style={styles.hourlyWeatherTitle}>
          {temp === 'celsius'
            ? (item.main['temp'] - kelvin).toFixed(0)
            : ((9 * (item.main['temp'] - kelvin) + 32 * 5) / 5).toFixed(0)}{' '}
          {temp === 'celsius' ? '°C' : '°F'}
        </Text>
        <Text style={styles.hourlyWeatherTime}>
          {item['dt_txt'].split(' ')[1].split(':').splice(0, 2).join(':')}
        </Text>
        <Text style={styles.hourlyWeatherTime}>
          {item['dt_txt'].split(' ')[0].split('-').splice(1, 2).join('.')}
        </Text>
      </View>
    )
  }

  useEffect(() => {
    if (isFocused) {
      if (route.params) {
        setCity(route.params.region)
        GetWeatherByXY(route.params.coord.lat, route.params.coord.lon)
      } else {
        if (city) {
          GetWeather()
        }
      }
    }
  }, [isFocused])

  return (
    <View style={styles.container}>
      <StatusBar />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather Forecast </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            navigation.navigate('saved')
          }}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={30}
            color={colors.DarkText}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputBlock}>
        <TextInput
          placeholder="city"
          value={city}
          onChangeText={(text) => setCity(text)}
          style={styles.input}
          placeholderTextColor={colors.DarkComment}
        />
        <TouchableOpacity
          onPress={() => {
            // Keyboard.dismiss
            setForecast({})
            setError('')
            GetWeather()
          }}
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {error ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorBlockText}>{error}</Text>
        </View>
      ) : (
        <>
          {forecast && forecast.list ? (
            <ScrollView
              style={{ flex: 1 }}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.weatherBlock}>
                <View style={styles.weatherLeftBlock}>
                  <Image
                    source={{
                      uri: `https://openweathermap.org/img/wn/${forecast.list[0].weather[0].icon}@2x.png`,
                    }}
                    style={{ width: 100, height: 100 }}
                  />
                  <Text style={styles.temperature}>
                    {temp === 'celsius'
                      ? (forecast.list[0].main['temp'] - kelvin).toFixed(0)
                      : (
                          (9 * (forecast.list[0].main['temp'] - kelvin) +
                            32 * 5) /
                          5
                        ).toFixed(0)}{' '}
                    {temp === 'celsius' ? '°C' : '°F'}
                  </Text>
                </View>
                <View style={styles.weatherRightBlock}>
                  <View style={styles.tempButtonBlock}>
                    <TouchableOpacity
                      style={[
                        styles.tempButtonTouch,
                        {
                          backgroundColor:
                            temp === 'celsius'
                              ? colors.ButtonPale
                              : colors.ButtonDark,
                        },
                      ]}
                      onPress={() => setTemp('celsius')}
                    >
                      <Text style={styles.tempButtonTitle}>°C</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.tempButtonTouch,
                        {
                          backgroundColor:
                            temp === 'fahrenheit'
                              ? colors.ButtonPale
                              : colors.ButtonDark,
                        },
                      ]}
                      onPress={() => setTemp('fahrenheit')}
                    >
                      <Text style={styles.tempButtonTitle}>°F</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.temperatureSmall}>
                    Feels like:{' '}
                    {temp === 'celsius'
                      ? (forecast.list[0].main['feels_like'] - kelvin).toFixed(
                          0
                        )
                      : (
                          (9 * (forecast.list[0].main['feels_like'] - kelvin) +
                            32 * 5) /
                          5
                        ).toFixed(0)}{' '}
                    {temp === 'celsius' ? '°C' : '°F'}
                  </Text>
                  <Text style={styles.temperatureSmall}>
                    Wind: {forecast.list[0].wind['speed'].toFixed(0)} m/s
                  </Text>
                  <Text style={styles.temperatureSmall}>
                    Humidity: {forecast.list[0].main['humidity']} %
                  </Text>
                </View>
              </View>
              <View style={styles.weatherBlock}>
                <FlatList
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                  data={forecast.list}
                  renderItem={RenderForecastItem}
                />
              </View>
              <View style={styles.cityBlock}>
                <View style={styles.cityBlockTitles}>
                  <Text style={styles.cityBlockCountry}>
                    Country: {forecast.city.country}
                  </Text>
                  <Text style={styles.cityBlockRegion}>
                    Region: {forecast.city.name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.saveButton}
                  disabled={buttonDissabled}
                  onPress={async () => {
                    const locations = await AsyncStorage.getItem('locations')

                    let locationsData = JSON.parse(locations as string)

                    if (locationsData !== null) {
                      locationsData.push({
                        country: forecast.city.country,
                        region: forecast.city.name,
                        coord: forecast.city.coord,
                        id: forecast.city.id,
                      })
                    } else {
                      locationsData = [
                        {
                          country: forecast.city.country,
                          region: forecast.city.name,
                          coord: forecast.city.coord,
                          id: forecast.city.id,
                        },
                      ]
                    }

                    await AsyncStorage.setItem(
                      'locations',
                      JSON.stringify(locationsData)
                    )
                    setButtonDissabled(true)
                  }}
                >
                  <Text
                    style={[
                      styles.saveButtonText,
                      {
                        color: buttonDissabled
                          ? colors.DarkComment
                          : colors.DarkText,
                      },
                    ]}
                  >
                    {buttonDissabled ? 'Saved' : 'Save Location'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cityComment}>
                Save this location and next time you want to check the weather
                here you can find this location saved in{' '}
                <Ionicons
                  name="cloud-upload-outline"
                  size={16}
                  color={colors.DarkComment}
                />{' '}
                page
              </Text>
            </ScrollView>
          ) : (
            <View style={styles.loadingView}>
              <Text style={styles.loadingText}>
                {loading ? 'Loading...' : `What's the weather outside`}
              </Text>
              <Ionicons
                name="partly-sunny-outline"
                size={150}
                color={colors.ButtonPale}
              />
            </View>
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.DarkBG,
    // alignItems: 'center',
    // justifyContent: 'center',
    paddingHorizontal: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 50,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: colors.DarkLine,
  },
  headerTitle: {
    color: colors.DarkText,
    fontSize: 24,
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 10,
  },

  inputBlock: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.ButtonDark,
    borderColor: colors.ButtonDarkOutline,
    borderWidth: 1,
    padding: 5,
    fontSize: 20,
    color: colors.DarkText,
    borderRadius: 5,
  },
  searchButton: {
    backgroundColor: colors.ButtonPale,
    borderColor: colors.ButtonPaleOutline,
    borderWidth: 1,
    marginLeft: 5,
    borderRadius: 5,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: colors.DarkComment,
    fontSize: 18,
  },

  cityBlock: {
    borderWidth: 2,
    borderColor: colors.ButtonPaleOutline,
    marginBottom: 10,
    borderRadius: 10,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityBlockTitles: {
    flexDirection: 'column',
  },
  cityBlockCountry: {
    fontSize: 18,
    color: colors.DarkText,
    fontWeight: '100',
  },
  cityBlockRegion: {
    fontSize: 18,
    color: colors.DarkText,
    fontWeight: '100',
  },
  saveButton: {
    padding: 10,
  },
  saveButtonText: {
    fontSize: 18,
    color: colors.DarkText,
  },
  cityComment: {
    fontSize: 16,
    color: colors.DarkComment,
  },

  weatherBlock: {
    backgroundColor: colors.ButtonPale,
    borderWidth: 2,
    borderColor: colors.ButtonPaleOutline,
    borderRadius: 10,
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weatherLeftBlock: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  weatherRightBlock: {
    height: '100%',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  tempButtonBlock: {
    padding: 2,
    borderRadius: 7,
    flexDirection: 'row',
    backgroundColor: colors.ButtonDark,
  },
  tempButtonTouch: {
    borderRadius: 5,
    padding: 5,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempButtonTitle: {
    fontSize: 22,
    color: colors.ButtonPaleOutline,
  },
  temperature: {
    fontSize: 28,
    color: colors.DarkText,
    fontWeight: '600',
  },
  temperatureSmall: {
    fontSize: 20,
    color: colors.DarkText,
    fontWeight: '300',
  },
  hourlyWeatherBlock: {
    flexDirection: 'column',

    paddingHorizontal: 10,
    alignItems: 'center',
  },
  hourlyWeatherTitle: {
    color: colors.DarkText,
    fontSize: 20,
  },
  hourlyWeatherTime: {
    flexShrink: 18,
    fontWeight: '300',
    color: colors.DarkComment,
  },
  separator: {
    height: '100%',
    width: 1,
    backgroundColor: colors.ButtonDark,
  },

  errorBlock: {
    backgroundColor: colors.Error,
    borderWidth: 2,
    borderColor: colors.ErrorOutline,
    borderRadius: 10,
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBlockText: {
    fontSize: 20,
    color: colors.DarkComment,
  },

  loadingView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.ButtonPale,
    fontSize: 26,
    fontWeight: '700',
  },
})
