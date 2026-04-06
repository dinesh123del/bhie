import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Glitter = ({ size, delay }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -150,
            duration: 8000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const x = Math.random() * width;
  const y = Math.random() * height;

  return (
    <Animated.View
      style={[
        styles.glitter,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
};

export const PremiumBackground = ({ children }) => {
  const glitters = Array.from({ length: 35 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5000,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1C1C1E', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Subtle Glows - Toned down for visual comfort */}
      <View style={[styles.glow, { top: -100, left: -100, backgroundColor: 'rgba(0, 122, 255, 0.04)' }]} />
      <View style={[styles.glow, { bottom: -150, right: -150, backgroundColor: 'rgba(175, 82, 222, 0.04)' }]} />

      {glitters.map((g) => (
        <Glitter key={g.id} size={g.size} delay={g.delay} />
      ))}
      
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  glitter: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  glow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  }
});

export default PremiumBackground;
