import Animated, {
  useSharedValue,
  Easing,
  useAnimatedProps,
  useDerivedValue,
  withSpring
} from "react-native-reanimated";
import { View, Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";
import Svg, { Path } from 'react-native-svg';


const SIZE = Dimensions.get('window').width;
const AnimatedPath = Animated.createAnimatedComponent(Path);

const adjustAxis = (value) => 0.5 + (-value / 1.5);


const Wave = () => {
  const linePoint = useSharedValue(0);
  const controlPoint = useSharedValue(0);


  const [orientation, setOrientation] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const subscription = useRef(null);


  const _subscribe = () => {
    subscription.current = Accelerometer.addListener(({ x, y, z }) => {
      setOrientation(() => ({
        x: x,
        y: y,
        z: z,
      }));
    });
  };

  const _unsubscribe = () => {
    subscription.current && subscription.current.remove();
    subscription.current = null;
  };

  useEffect(() => {
    _subscribe()
    return () => _unsubscribe();
  }, []);


  linePoint.value = withSpring(adjustAxis(orientation.x), {
    damping: 1000,
    mass: 1,
    stiffness: 10,
    restDisplacementThreshold: 0.0001,
    restSpeedThreshold: 0.001,
  });


  const value = (adjustAxis(orientation.x) / 2) + 0.25;

  controlPoint.value = withSpring(value, {
    easing: Easing.linear(Easing.bounce),
  });


  const data = useDerivedValue(() => {
    return {
      start: { x: 0, y: linePoint.value },
      c1: { x: 0.4, y: controlPoint.value },
      c2: { x: 0.6, y: 1 - controlPoint.value },
      end: { x: 1, y: 1 - linePoint.value },
    };
  });


  const path = useAnimatedProps(() => {
    const { start, c1, c2, end } = data.value;
    return {
      d: `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y} L 1 1 L 0 1 Z`,
    };
  });


  return (
    <View
      style={styles.container}
    >
      <Svg
        width={SIZE}
        height={SIZE}
        style={styles.svg}
        viewBox="0 0 1 1"
      >
        <AnimatedPath
          fill={'#0099ff'}
          animatedProps={path}
        />
      </Svg>
    </View>
  );
}


const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#273036',
  },
  svg: { backgroundColor: '#273036', zIndex: 1 },
  text: {
    fontSize: 30,
    color: '#ffffff',
    zIndex: 10,
  },
};



export default Wave