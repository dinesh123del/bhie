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
    backgroundColor: '#11141B',
    borderRadius: 24,
    marginVertical: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  inner: {
    padding: 24,
  }
});

export default Card;
