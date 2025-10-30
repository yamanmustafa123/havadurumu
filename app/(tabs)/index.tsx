import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import axios from 'axios';


interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    description: string;
    main: string; 
  }[];
}


const API_KEY = 'anatar alanı'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// --- Arka Plan Resimleri  ---
const BACKGROUND_MAP: { [key: string]: any } = {
  Rain: require('../../assets/images/rainn.jpg'), 
  Clear: require('../../assets/images/clean.jpg'),
  Clouds: require('../../assets/images/bulutlu.jpg'),
  Default: require('../../assets/images/default.jpg'),
};


export default function WeatherScreen() {
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
  const [searchText, setSearchText] = useState('Shanghai'); 

  const fetchWeather = async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<WeatherData>(BASE_URL, {
        params: {
          q: city,
          units: 'metric',
          appid: API_KEY,
          lang: 'tr',
        },
      });

     
      setWeatherData(response.data);
      console.log('Hava Durumu Verisi Başarılı');

    } catch (err: any) { 
      console.error('API Çağrısı Başarısız:', err);
    
      setError('Aranan şehir bulunamadı veya bir bağlantı sorunu oluştu.');
      setWeatherData(null); 
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchWeather(searchText);
  }, []); 


  // --- Helper Fonksiyonlar ---
  const handleSearch = () => {
   
    if (searchText.trim() !== '') {
        fetchWeather(searchText);
    }
  }

  const getBackgroundImage = () => {
    if (!weatherData) return BACKGROUND_MAP.Default;
    const weatherMain = weatherData.weather[0]?.main || 'Default';
    return BACKGROUND_MAP[weatherMain] || BACKGROUND_MAP.Default;
  };

  // --- Render (Görünüm) ---

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff' }}>Hava durumu yükleniyor...</Text>
      </View>
    );
  }

  
  if (error && !weatherData) {
     return (
        <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{error}</Text>
            
            <SearchInput searchText={searchText} setSearchText={setSearchText} handleSearch={handleSearch} />
        </View>
    );
  }
  
 
  const cityName = weatherData?.name;
  const temp = Math.round(weatherData?.main?.temp ?? 0); 
  const description = weatherData?.weather?.[0]?.description;

  return (
 
    <ImageBackground 
        source={getBackgroundImage()} 
        style={styles.backgroundImage}
        resizeMode="cover"
    >

        <View style={styles.overlay}> 

            <View style={styles.mainContent}>

                <Text style={styles.city}>{cityName}</Text>
                

                <Text style={styles.description}>{description}</Text>
                

                <Text style={styles.temperature}>{temp}°</Text>
            </View>


            <SearchInput 
                searchText={searchText} 
                setSearchText={setSearchText} 
                handleSearch={handleSearch} 
            />
            
        </View>
    </ImageBackground>
  );
}



interface SearchInputProps {
    searchText: string;
    setSearchText: React.Dispatch<React.SetStateAction<string>>;
    handleSearch: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ searchText, setSearchText, handleSearch }) => (
    <View style={searchStyles.container}>
        <TextInput
            style={searchStyles.input}
            placeholder="Search any city"
            placeholderTextColor="#ddd"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch} 
            returnKeyType="search"
        />

    </View>
);

// --- Stil Tanımlamaları ---

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    justifyContent: 'space-between', 
    paddingTop: 120, 
    paddingBottom: 40,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  city: {
    fontSize: 48,
    color: '#fff',
    fontWeight: '300',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 20,
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  temperature: {
    fontSize: 100,
    color: '#fff',
    fontWeight: '200',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34495e',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    marginBottom: 20,
  }
});

const searchStyles = StyleSheet.create({
    container: {
        width: '80%',
        alignSelf: 'center',
        paddingHorizontal: 15,
        backgroundColor: 'rgba(52, 73, 94, 0.5)', 
        borderRadius: 5,
        height: 50,
        justifyContent: 'center',
        marginBottom: 20,
    },
    input: {
        color: '#fff',
        fontSize: 18,
    },
    
});