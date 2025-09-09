import { StyleSheet, Text, TouchableOpacity, View, Animated, Dimensions } from "react-native";
import React, { useEffect, useRef } from "react";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get('window');

const Page = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(50)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);
    
    sequence.start();
  }, []);

  const handleContinue = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace("/(tabs)");
    });
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background Elements */}
      <View style={styles.backgroundGradient}>
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
      </View>

      {/* Header Section */}
      <View style={styles.header}>
        <Animated.View 
          style={[
            styles.logoSection,
            {
              opacity: logoAnim,
              transform: [{
                scale: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }]
            }
          ]}
        >
          {/* Modern Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <View style={styles.logoIconContainer}>
                <View style={styles.logoSquare1} />
                <View style={styles.logoSquare2} />
                <View style={styles.logoSquare3} />
              </View>
            </View>
          </View>
          
          {/* Brand Name */}
          <Animated.View 
            style={[
              styles.brandContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: textAnim }]
              }
            ]}
          >
            <Text style={styles.brandName}>TinMOI</Text>
            <View style={styles.brandUnderline} />
            <Text style={styles.brandTagline}>Nền tảng tin tức chính thống</Text>
          </Animated.View>
        </Animated.View>
      </View>

      

      {/* Footer Section */}
      <Animated.View 
        style={[
          styles.footer,
          {
            opacity: buttonAnim,
            transform: [{
              translateY: buttonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              })
            }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Khám phá ngay</Text>
          <View style={styles.buttonIconContainer}>
            <Text style={styles.buttonIcon}>→</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.footerInfo}>
          <Text style={styles.versionText}>v1.0.0</Text>
          <View style={styles.dot} />
          <Text style={styles.copyrightText}>© 2024 NewsHub</Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  
  gradientCircle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#DC2626',
    opacity: 0.03,
    top: -width * 0.3,
    right: -width * 0.2,
  },
  
  gradientCircle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#DC2626',
    opacity: 0.02,
    bottom: -width * 0.2,
    left: -width * 0.1,
  },
  
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  
  logoSection: {
    alignItems: 'center',
  },
  
  logoContainer: {
    marginBottom: 40,
  },
  
  logoBackground: {
    width: 80,
    height: 80,
    backgroundColor: '#DC2626',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  
  logoIconContainer: {
    width: 40,
    height: 32,
    position: 'relative',
  },
  
  logoSquare1: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    top: 0,
    left: 0,
  },
  
  logoSquare2: {
    position: 'absolute',
    width: 20,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    top: 0,
    right: 0,
  },
  
  logoSquare3: {
    position: 'absolute',
    width: 40,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    bottom: 0,
    left: 0,
  },
  
  brandContainer: {
    alignItems: 'center',
  },
  
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 2,
    marginBottom: 8,
  },
  
  brandUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#DC2626',
    borderRadius: 2,
    marginBottom: 12,
  },
  
  brandTagline: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  contentSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  welcomeText: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 8,
  },
  
  platformText: {
    fontSize: 22,
    color: '#111827',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 50,
    lineHeight: 28,
  },
  
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 24,
  },
  
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
    alignItems: 'center',
  },
  
  continueButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#DC2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  
  buttonIconContainer: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  buttonIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  
  copyrightText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});