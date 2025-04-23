// src/screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';

const DashboardScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('Alex');
  const [weatherData, setWeatherData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  useEffect(() => {
    // Fetch user data
    fetchUserData();
    
    // Fetch weather data
    fetchWeatherData();
    
    // Fetch outfit recommendations
    fetchRecommendations();
  }, []);
  
  const fetchUserData = async () => {
    try {
      const response = await axios.get('https://localhost:5000/user-profile', {
        headers: { Authorization: 'Bearer YOUR_TOKEN' }
      });
      setUserName(response.data.name);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  const fetchWeatherData = async () => {
    try {
      // Get user's location or use default
      const location = 'New York'; // This would be dynamic in a real app
      const response = await axios.get(`https://localhost:5000/weather?location=${location}`);
      setWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };
  
  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('https://localhost:5000/recommendations', {
        headers: { Authorization: 'Bearer YOUR_TOKEN' }
      });
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity>
            <Text>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome back, {userName}!</Text>
        <View style={styles.recommendationBanner}>
          <Text style={styles.recommendationText}>
            Here are your personalized style recommendations for today.
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Styling</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.styleCard}>
            <Text style={styles.styleCardText}>Summer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.styleCard}>
            <Text style={styles.styleCardText}>Business Chic</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Styles</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.trendingCard}>
          <View style={styles.trendingCardContent}>
            <Text style={styles.trendingCardTitle}>Summer 2023 Collection</Text>
            <Text style={styles.trendingCardDescription}>Discover the latest trends for the season</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.recommendationCard}>
          <View style={styles.recommendationCardContent}>
            <Text style={styles.recommendationCardTitle}>Color Coordination Guide</Text>
            <Text style={styles.recommendationCardDescription}>Based on your recent outfits</Text>
            
            <View style={styles.colorPalette}>
              <View style={[styles.colorCircle, { backgroundColor: '#3B5998' }]} />
              <View style={[styles.colorCircle, { backgroundColor: '#4CAF50' }]} />
              <View style={[styles.colorCircle, { backgroundColor: '#CD853F' }]} />
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.recommendationCard}>
          <View style={styles.recommendationCardContent}>
            <Text style={styles.recommendationCardTitle}>Accessory Pairing Tips</Text>
            <Text style={styles.recommendationCardDescription}>Elevate your style with these accessories</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.analysisCard} onPress={() => navigation.navigate('StyleAnalysis')}>
          <View style={styles.analysisCardContent}>
            <Text style={styles.analysisCardTitle}>Style Analysis</Text>
            <Text style={styles.analysisCardDescription}>Get personalized insights based on your wardrobe</Text>
          </View>
          <TouchableOpacity style={styles.analyzeButton}>
            <Text style={styles.analyzeButtonText}>Analyze</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
  },
  welcomeContainer: {
    padding: 20,
    paddingTop: 0,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  recommendationBanner: {
    backgroundColor: '#5D3FD3',
    borderRadius: 10,
    padding: 15,
  },
  recommendationText: {
    color: 'white',
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: '#5D3FD3',
    fontSize: 14,
  },
  styleCard: {
    width: 150,
    height: 150,
    backgroundColor: 'white',
    borderRadius: 15,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  styleCardText: {
    fontSize: 16,
    fontWeight: '500',
  },
  trendingCard: {
    width: '100%',
    height: 180,
    backgroundColor: '#333',
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  trendingCardContent: {
    padding: 20,
  },
  trendingCardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trendingCardDescription: {
    color: 'white',
    fontSize: 14,
  },
  recommendationCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recommendationCardContent: {
    padding: 20,
  },
  recommendationCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recommendationCardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    marginTop: 10,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  analysisCard: {
    width: '100%',
    backgroundColor: '#5D3FD3',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  analysisCardContent: {
    flex: 1,
  },
  analysisCardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  analysisCardDescription: {
    color: 'white',
    fontSize: 14,
  },
  analyzeButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  analyzeButtonText: {
    color: '#5D3FD3',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
