import React, { useEffect, useState } from 'react'
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import colors from '../constans/colors'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

interface LocationsInterface {
  coord?: object
  region?: any
  id?: any
}

interface LocationInterface extends Array<LocationsInterface> {}

// interface EnumServiceItems extends Array<EnumServiceItem>{}

export default function SavedScreen({ navigation }: any) {
  const [savedLocations, setSavedLocations] =
    React.useState<LocationInterface>()
  async function GetLocations() {
    const locations = await AsyncStorage.getItem('locations')
    let locationsData = JSON.parse(locations as string)

    if (locationsData !== null) {
      setSavedLocations(locationsData)
    }
  }
  useEffect(() => {
    GetLocations()
  }, [])

  function RenderLocations({ item }: any) {
    return (
      <TouchableOpacity
        style={styles.itemBlock}
        onPress={() => {
          navigation.navigate('weather', {
            country: item.country,
            region: item.region,
            coord: item.coord,
            id: item.id,
          })
        }}
      >
        <Text style={styles.itemBlockText}>
          {item.country} {item.region}
        </Text>
        <TouchableOpacity
          style={{ padding: 5 }}
          onPress={async () => {
            setSavedLocations([])

            let tryArr: LocationInterface = []
            savedLocations?.forEach((i) => {
              if (i.id !== item.id) {
                tryArr.push(i)
              }
            })

            setSavedLocations(tryArr)

            await AsyncStorage.setItem('locations', JSON.stringify(tryArr))
          }}
        >
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.DarkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Locations </Text>
      </View>
      {savedLocations && savedLocations.length > 0 ? (
        <FlatList
          style={{ width: '100%' }}
          data={savedLocations}
          renderItem={RenderLocations}
        />
      ) : (
        <>
          <Text style={styles.sleepyText}>
            You can save locations here from the main page
          </Text>
          <MaterialCommunityIcons
            name="sleep"
            size={150}
            color={colors.ButtonPale}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.DarkBG,
    alignItems: 'center',
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
    marginBottom: 10,
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

  itemBlock: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.ButtonPaleOutline,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemBlockText: {
    color: colors.DarkText,
    fontSize: 24,
  },
  sleepyText: {
    color: colors.ButtonPale,
    fontSize: 26,
    fontWeight: '700',
  },
})
