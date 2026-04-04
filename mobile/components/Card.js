import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const Card = ({ children, style, onPress, delay = 0 }) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Animated.View 
      entering={FadeInUp.delay(delay).duration(600)}
      style={[styles.card, style]}
    >
      <Container style={styles.inner} onPress={onPress}>
        {children}
      </Container>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  inner: {
    padding: 20,
  }
});

export default Card;
