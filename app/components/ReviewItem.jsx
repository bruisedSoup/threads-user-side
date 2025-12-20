import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

const ReviewItem = ({ review }) => {
  const { user_id, rating, comment, created_at } = review;
  const userName = user_id ? `${user_id.first_name} ${user_id.last_name}` : 'Anonymous';
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  color="#FFD700"
                  fill={index < rating ? "#FFD700" : "white"}
                />
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.date}>{formatDate(created_at)}</Text>
      </View>
      <Text style={styles.comment}>{comment}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  comment: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});

export default ReviewItem;