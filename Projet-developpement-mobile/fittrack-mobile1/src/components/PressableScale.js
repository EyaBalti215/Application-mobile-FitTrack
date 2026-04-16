import { useRef } from 'react';
import { Animated, TouchableOpacity, Vibration } from 'react-native';

export default function PressableScale({
  children,
  onPress,
  style,
  activeScale = 0.96,
  hapticMs = 8,
  activeOpacity = 1,
  disabled = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      friction: 7,
    }).start();
  };

  const handlePressIn = () => {
    if (disabled) {
      return;
    }
    if (hapticMs > 0) {
      Vibration.vibrate(hapticMs);
    }
    animateTo(activeScale);
  };

  const handlePressOut = () => {
    if (disabled) {
      return;
    }
    animateTo(1);
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={activeOpacity}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}
