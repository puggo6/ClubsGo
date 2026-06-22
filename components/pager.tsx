// components/Pager.tsx
import { COLORS } from "@/constants/theme";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";

type PagerProps = {
  pages: React.ReactNode[];
  surface?: boolean;
  bottomDots?: boolean;
};
const screenWidth = Dimensions.get("window").width;
export const Pager = ({
  pages,
  surface = true,
  bottomDots = true,
}: PagerProps) => {
  const width = screenWidth;
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  );

  return (
    <View style={surface ? styles.surfaceContainer : styles.blankContainer}>
      {!bottomDots && (
        <View style={styles.dotsContainer}>
          {pages.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
      <FlatList
        data={pages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.pageContainer}>{item}</View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
      />
      {bottomDots && (
        <View style={styles.dotsContainer}>
          {pages.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
};
type ConditionalPagerProps = {
  condition: boolean;
  surface: boolean;
  pages: React.ReactNode[];
  bottomDots?: boolean;
};

export const ConditionalPager = ({
  condition,
  surface,
  pages,
  bottomDots,
}: ConditionalPagerProps) => {
  if (condition) {
    return <Pager pages={pages} surface={surface} bottomDots={bottomDots} />;
  }

  return <>{pages[0]}</>;
};
const styles = StyleSheet.create({
  blankContainer: {
    paddingVertical: 15,
    alignItems: "center",

    marginBottom: 15,

    width: screenWidth * 0.96,
    justifyContent: "center",
  },
  surfaceContainer: {
    backgroundColor: COLORS.surface,

    borderRadius: 25,

    paddingVertical: 15,
    alignSelf: "center",
    alignItems: "center",

    marginBottom: 15,

    width: screenWidth * 0.96,
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pageContainer: {
    width: screenWidth * 0.96,
    alignSelf: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
    paddingBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceAlternate, // inactive dot blends into surface
  },
  dotActive: {
    width: 18,
    borderRadius: 3,
    height: 6,
    backgroundColor: COLORS.textSecondary, // cyan highlight for active dot
  },
});
