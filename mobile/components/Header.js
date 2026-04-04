import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const Header = ({ title, showBack = false, onBackPress, rightIcon, onRightPress }) => {
  const handlePress = (callback) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    callback?.();
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity onPress={() => handlePress(onBackPress)} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>
        {rightIcon && (
          <TouchableOpacity onPress={() => handlePress(onRightPress)} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={24} color="#38BDF8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 110,
    backgroundColor: '#0A0D14',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  rightIcon: {
    padding: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  }
});

export default Header;
