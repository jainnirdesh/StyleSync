// src/screens/WardrobeScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';

const WardrobeScreen = () => {
  const [wardrobe, setWardrobe] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const pickImage = async () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const sourceUri = response.assets[0].uri;
        uploadImage(sourceUri);
      }
    });
  };
  
  const uploadImage = async (imageUri) => {
    setLoading(true);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'clothing_item.jpg',
    });
    
    try {
      // Upload to your backend
      const response = await axios.post('http://localhost:5000/upload-clothing', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer YOUR_TOKEN',
        },
      });
      
      // Add new item to wardrobe
      if (response.data.success) {
        setWardrobe([...wardrobe, response.data.item]);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderWardrobeItem = ({ item }) => (
    <TouchableOpacity style={styles.wardrobeItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemCategory}>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wardrobe</Text>
      </View>
      
      <TouchableOpacity style={styles.addButton} onPress={pickImage} disabled={loading}>
        <Text style={styles.addButtonText}>{loading ? 'Uploading...' : 'Add New Item'}</Text>
      </TouchableOpacity>
      
      {wardrobe.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your wardrobe is empty!</Text>
          <Text style={styles.emptySubtext}>Add some clothing items to get started.</Text>
        </View>
      ) : (
        <FlatList
          data={wardrobe}
          renderItem={renderWardrobeItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#5D3FD3',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 10,
  },
  wardrobeItem: {
    flex: 1,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    padding: 10,
    paddingBottom: 5,
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});

export default WardrobeScreen;
