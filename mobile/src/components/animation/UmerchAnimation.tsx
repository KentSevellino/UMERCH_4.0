import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RED = "#B00000";

const STEPS = ["welcome", "store", "variety", "final"] as const;
type Step = (typeof STEPS)[number];

type PageContent = {
  title: string;
  subtitle: string;
};

const PAGE_CONTENT: Record<Step, PageContent> = {
  welcome: {
    title: "Welcome",
    subtitle: "Let's get started",
  },
  store: {
    title: "No more going to store!",
    subtitle: "Own the design product in seconds by viewing it from the app.",
  },
  variety: {
    title: "The abundance of variety will make you happy!",
    subtitle: "We have a lot of variety and merchandise.",
  },
  final: {
    title: "",
    subtitle: "",
  },
};

export default function UmerchAnimation() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const widthRef = useRef(width);
  widthRef.current = width;

  const cardHeight = height * 0.34;
  const logoSize = Math.min(height * 0.2, 140);
  const finalLogoSize = Math.min(height * 0.34, width * 0.9, 340);

  const [index, setIndex] = useState(0);
  const phase = STEPS[index];
  const indexRef = useRef(0);

  const ready = useRef(false);
  const animating = useRef(false);

  const patternOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.1)).current;
  const logoTranslateY = useRef(new Animated.Value(height * 0.1)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(cardHeight)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  const animatePanTo = (target: number) => {
    if (!ready.current || animating.current) return;

    const clamped = Math.max(0, Math.min(STEPS.length - 1, target));

    if (clamped === indexRef.current) {
      animating.current = true;
      Animated.spring(panX, {
        toValue: -clamped * widthRef.current,
        useNativeDriver: true,
      }).start(() => {
        animating.current = false;
      });
      return;
    }

    animating.current = true;

    Animated.timing(cardFade, {
      toValue: 0,
      duration: 130,
      useNativeDriver: true,
    }).start(() => {
      indexRef.current = clamped;
      setIndex(clamped);

      Animated.parallel([
        Animated.timing(panX, {
          toValue: -clamped * widthRef.current,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        animating.current = false;
      });
    });
  };

  const animatePanToRef = useRef(animatePanTo);
  animatePanToRef.current = animatePanTo;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        ready.current &&
        !animating.current &&
        Math.abs(g.dx) > 4 &&
        Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
      onPanResponderMove: (_, g) => {
        let dx = g.dx;
        if (indexRef.current === 0 && dx > 0) dx *= 0.35;
        else if (indexRef.current === STEPS.length - 1 && dx < 0) dx *= 0.35;
        panX.setValue(-indexRef.current * widthRef.current + dx);
      },
      onPanResponderRelease: (_, g) => {
        const threshold = widthRef.current * 0.22;
        let target = indexRef.current;
        if (g.dx < -threshold || (g.vx < -0.5 && g.dx < -12)) target += 1;
        else if (g.dx > threshold || (g.vx > 0.5 && g.dx > 12)) target -= 1;
        animatePanToRef.current(target);
      },
      onPanResponderTerminate: () => {
        animatePanToRef.current(indexRef.current);
      },
    }),
  ).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          speed: 8,
          bounciness: 4,
          useNativeDriver: true,
        }),
        Animated.timing(patternOpacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1.14,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(() => {
      ready.current = true;
    });

    return () => animation.stop();
  }, []);

  const handleNext = () => {
    if (indexRef.current >= STEPS.length - 1) {
      handleSignIn();
      return;
    }
    animatePanToRef.current(indexRef.current + 1);
  };

  const handleSignIn = () => {
    router.replace("/login");
  };

  const renderDots = (activeStep: Step) => (
    <View style={coreStyles.dotsRow}>
      {STEPS.map((step) => (
        <View
          key={step}
          style={[coreStyles.dot, step === activeStep && coreStyles.dotActive]}
        />
      ))}
    </View>
  );

  const styles = {
    logo: { width: logoSize, height: logoSize },
    coverImage: { width: "100%" as const, height: "100%" as const },
    slide: { width, height },
    strip: { width: width * STEPS.length },
    finalLogo: { width: finalLogoSize, height: finalLogoSize },
  };

  return (
    <View style={coreStyles.container}>
      {/* Subtle geometric UM pattern background (welcome / opening) */}
      <Animated.View
        style={[coreStyles.patternLayer, { opacity: patternOpacity }]}
        pointerEvents="none"
      >
        <ImageBackground
          source={require("../../assets/images/umerch-pattern1.png")}
          style={coreStyles.patternImage}
          resizeMode="repeat"
        />
      </Animated.View>

      {/* Swipeable image strip: the images slide, the text card below does not */}
      <Animated.View
        style={[
          coreStyles.strip,
          styles.strip,
          { transform: [{ translateX: panX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Slide 0 — Welcome (pattern + animated logo) */}
        <View style={[coreStyles.slide, styles.slide]}>
          <Animated.View
            style={[
              coreStyles.openingLogo,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { translateY: logoTranslateY },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <Image
              source={require("../../assets/images/umerch-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Slide 1 — No more going to store */}
        <View style={[coreStyles.slide, styles.slide]}>
          <Image
            source={require("../../assets/images/model.jpg")}
            style={styles.coverImage}
            resizeMode="cover"
          />
        </View>

        {/* Slide 2 — Product variety */}
        <View style={[coreStyles.slide, styles.slide]}>
          <Image
            source={require("../../assets/images/ambassadors.jpg")}
            style={styles.coverImage}
            resizeMode="cover"
          />
        </View>

        {/* Slide 3 — Final UMerch login screen */}
        <View style={[coreStyles.slide, coreStyles.finalSlide, styles.slide]}>
          <View style={[coreStyles.finalBody, { paddingBottom: cardHeight }]}>
            <Image
              source={require("../../assets/images/um-umerch.png")}
              style={styles.finalLogo}
              resizeMode="contain"
            />
          </View>
        </View>
      </Animated.View>

      {/* Static white text card at the bottom (does not slide with images) */}
      <Animated.View
        style={[
          coreStyles.card,
          { height: cardHeight, transform: [{ translateY: cardSlide }] },
        ]}
      >
        <Animated.View style={[coreStyles.cardContent, { opacity: cardFade }]}>
          <View style={coreStyles.cardBody}>
            <Text style={coreStyles.title}>{PAGE_CONTENT[phase].title}</Text>
            {PAGE_CONTENT[phase].subtitle !== "" && (
              <Text style={coreStyles.subtitle}>
                {PAGE_CONTENT[phase].subtitle}
              </Text>
            )}
          </View>

          <View
            style={[
              coreStyles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
            <View style={coreStyles.dotsContainer}>
              {renderDots(phase)}
            </View>

            <View style={coreStyles.buttonRow}>
              {phase === "final" ? (
                <TouchableOpacity
                  style={coreStyles.nextButton}
                  onPress={handleSignIn}
                  activeOpacity={0.8}
                >
                  <Text style={coreStyles.nextButtonText}>Sign In</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={coreStyles.nextButton}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={coreStyles.nextButtonText}>Next</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                    style={coreStyles.nextIcon}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const coreStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RED,
    overflow: "hidden",
  },
  patternLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternImage: {
    flex: 1,
    backgroundColor: RED,
  },
  strip: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    flexDirection: "row",
  },
  slide: {
    overflow: "hidden",
  },
  openingLogo: {
    position: "absolute",
    top: "12%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  finalSlide: {
    backgroundColor: "#FFFFFF",
  },
  finalBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  finalBrand: {
    marginTop: 12,
    fontSize: 44,
    fontWeight: "900",
    color: RED,
    letterSpacing: 1,
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    zIndex: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardBody: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "900",
    color: RED,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "500",
    color: "#333333",
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  dotsContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonRow: {
    alignItems: "flex-end",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E3E3E3",
    marginRight: 7,
  },
  dotActive: {
    width: 22,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },
  nextButton: {
    height: 50,
    minWidth: 128,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  nextIcon: {
    marginLeft: 8,
  },
});
